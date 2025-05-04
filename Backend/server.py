from flask import Flask, request, jsonify
import json
import pymysql
import requests
from flask_cors import CORS 
from shapely.geometry import Point
from datetime import datetime, timedelta, timezone
from pymysql.err import MySQLError
import bcrypt

from flask_swagger_ui import get_swaggerui_blueprint
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager

app = Flask(__name__)
CORS(app)

#flask-swagger stuff
SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI (without trailing '/')
API_URL = '/static/swagger.json'  # Our API url (can of course be a local resource)

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,  # Swagger UI static files will be mapped to '{SWAGGER_URL}/dist/'
    API_URL,
    config={  # Swagger UI config overrides
        'app_name': "Test application"
    },
    # oauth_config={  # OAuth config. See https://github.com/swagger-api/swagger-ui#oauth2-configuration .
    #    'clientId': "your-client-id",
    #    'clientSecret': "your-client-secret-if-required",
    #    'realm': "your-realms",
    #    'appName': "your-app-name",
    #    'scopeSeparator': " ",
    #    'additionalQueryStringParams': {'test': "hello"}
    # }
)

app.register_blueprint(swaggerui_blueprint)

#jwt app token management
app.config["JWT_SECRET_KEY"] = "SecretKey"
jwt = JWTManager(app)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24) # amount of time a token will stay valid, change hours value
#end of jwt token management

HOST = "localhost"
USER = "root"
PASSWORD = "Minecraft928"
DB = "backend"


@app.route('/negotiations/manager/<int:manager_id>', methods=['GET'])
@jwt_required()
def get_negotiations_for_manager(manager_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Corrected SQL to use the proper column name "vin"
            sql = """
            SELECT u.user_id, u.first_name as user_name, n.vin, n.proposed_price, n.price_status
            FROM negotiation n
            JOIN users u ON u.user_id = n.cust_id
            WHERE n.manager_id = %s
            """
            cursor.execute(sql, (manager_id,))
            results = cursor.fetchall()
            return jsonify(results)
    except Exception as e:
        app.logger.error(f"Failed to fetch negotiations: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/update_car_price', methods=['POST'])
@jwt_required()
def update_car_price():
    data = request.get_json()
    vin = data['vin']
    new_price = data['proposed_price']

    # Initialize connection as None to ensure it's accessible throughout the function scope
    connection = None  
    try:
        connection = get_db_connection()  # Assign the actual database connection
        with connection.cursor() as cursor:
            sql = "UPDATE car_details SET price = %s WHERE vin = %s"
            cursor.execute(sql, (new_price, vin))
            connection.commit()
            return jsonify({"message": "Car price updated successfully"}), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()  # Safely close the connection if it was successfully opened




@app.route('/api/car_details/<vin>', methods=['GET'])
def get_car_details(vin):
    user_id = request.headers.get("User-ID")
    car = get_car_from_db(vin)
    negotiation = get_active_negotiation(user_id, vin)
    if negotiation and negotiation['status'] == 'accepted':
        car['price'] = negotiation['negotiated_price']
    return jsonify(car)




@app.route('/negotiations/start', methods=['POST'])
@jwt_required()
def start_negotiation():
    data = request.get_json()
    userId = data.get('userId')
    managerId = data.get('managerId')
    vehicleId = data.get('vehicleId')
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            # Check if a negotiation already exists for this user and vehicle
            check_sql = """
            SELECT * FROM negotiation
            WHERE cust_id = %s AND vin = %s
            """
            cursor.execute(check_sql, (userId, vehicleId))
            existing_negotiation = cursor.fetchone()

            if existing_negotiation:
                return jsonify({'message': 'Negotiation already exists'}), 409

            # Insert new negotiation
            insert_sql = """
            INSERT INTO negotiation (cust_id, manager_id, vin)
            VALUES (%s, %s, %s)
            """
            cursor.execute(insert_sql, (userId, managerId, vehicleId))
            conn.commit()
            return jsonify({'message': 'Negotiation started successfully'}), 201

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Failed to start negotiation: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@app.route('/negotiations/propose_price', methods=['POST'])
@jwt_required()
def propose_price():
    data = request.get_json()
    negotiation_id = data.get('negotiation_id')  # Vehicle VIN
    user_id = data.get('user_id')
    manager_id = data.get('manager_id')
    proposed_price = data.get('proposed_price')

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
            UPDATE negotiation 
            SET proposed_price = %s, price_status = 'pending', price_proposed_date = NOW()
            WHERE cust_id = %s AND manager_id = %s AND vin = %s
            """
            cursor.execute(sql, (proposed_price, user_id, manager_id, negotiation_id))
            if cursor.rowcount == 0:
                return jsonify({"message": "Negotiation not found or price already proposed"}), 404
            conn.commit()
            return jsonify({"message": "Price proposed successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/negotiations/price_response', methods=['POST'])
@jwt_required()
def price_response():
    data = request.get_json()
    vin = data['vin']
    manager_id = data['managerId']
    response = data['response']  # "accepted" or "rejected"
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Update negotiation status
            sql_update_status = "UPDATE negotiation SET price_status = %s, price_updated_date = NOW() WHERE vin = %s AND manager_id = %s"
            cursor.execute(sql_update_status, (response, vin, manager_id))
            if cursor.rowcount == 0:
                return jsonify({"message": "No negotiation found to update"}), 404
            conn.commit()

            # Fetch the proposed price if the price was accepted
            if response == "accepted":
                sql_fetch_price = "SELECT proposed_price FROM negotiation WHERE vin = %s AND manager_id = %s"
                cursor.execute(sql_fetch_price, (vin, manager_id))
                result = cursor.fetchone()
                if result:
                    return jsonify({"message": f"Price {response} successfully", "proposed_price": result['proposed_price']}), 201
                else:
                    return jsonify({"message": "Negotiation found but failed to fetch proposed price"}), 500
            else:
                return jsonify({"message": f"Price {response} successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()





@app.route("/updatePrice", methods=['POST'])
def update_price():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data['vin']
    new_price = data['new_price']

    try:
        with db.cursor() as cursor:
            sql = "UPDATE car_details SET price = %s WHERE vin = %s"
            cursor.execute(sql, (new_price, vin))
            db.commit()
        return jsonify({'message': 'Price updated successfully'}), 200
    finally:
        db.close()




@app.route("/managers", methods=['GET'])
def get_managers():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            # Assuming job_title 'Manager' identifies managers
            sql = """SELECT user_id as id, CONCAT(first_name, ' ', last_name) as name
                     FROM users u
                     JOIN jobs j ON u.job_id = j.job_id
                     WHERE j.job_title = 'Manager'"""
            cursor.execute(sql)
            managers = cursor.fetchall()
        return jsonify(managers), 200
    finally:
        db.close()



@app.route("/messages/<string:vin>/<int:manager_id>/<int:cust_id>", methods=['GET'])
@jwt_required()
def get_messages(vin, manager_id, cust_id):
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
            SELECT ch.from_id, ch.to_id, ch.description, ch.insert_date
            FROM chat_history ch
            WHERE ch.vin = %s AND ((ch.from_id = %s AND ch.to_id = %s) OR (ch.from_id = %s AND ch.to_id = %s))
            ORDER BY ch.insert_date ASC
            """
            cursor.execute(sql, (vin, manager_id, cust_id, cust_id, manager_id))
            messages = cursor.fetchall()
            if not messages:
                return jsonify([]), 200  # Return an empty list if no messages
            return jsonify(messages), 200
    finally:
        db.close()




def get_db_connection():
    return pymysql.connect(host=HOST,
                           user=USER,
                           password=PASSWORD,
                           db=DB,
                           charset='utf8mb4',
                           cursorclass=pymysql.cursors.DictCursor)


@app.route('/messages', methods=['POST'])
@jwt_required()
def post_message():
    data = request.get_json()
    from_id = data.get('from_id')
    to_id = data.get('to_id')
    description = data.get('description')  # Change from 'message' to 'description'
    vehicle_id = data.get('vehicle_id')  # Get vehicle_id from request

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO chat_history (from_id, to_id, description, vin, insert_date, update_date) VALUES (%s, %s, %s, %s, NOW(), NOW())"
            cursor.execute(sql, (from_id, to_id, description, vehicle_id))  # Include vehicle_id and timestamps
            conn.commit()
        return {"message": "Message sent successfully"}, 201
    finally:
        conn.close()


# Added by Percy
@app.route("/updateDealershipService", methods=['POST'])
@jwt_required()
def updateDealershipService():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    service_option = data.get('option_id')
    description = data.get('description')
    price = data.get('price')
    
    with db.cursor() as cursor:
        query = """
                UPDATE service_options
                SET description = %s, price = %s
                WHERE option_id = %s
                """
        cursor.execute(query, ([description], [price], [service_option]))
        db.commit()
        response = {
                'message': 'Service updated.'
            }
        return jsonify(response), 200
    

# Added by Percy
@app.route("/addDealershipService", methods=['POST'])
@jwt_required()
def addDealershipService():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    service_option = data.get('service_option')
    price = data.get('price')
    print("Got here!")
    with db.cursor() as cursor:
        query = """
                INSERT INTO service_options (description, price, insert_date, update_date) VALUES 
                                    (%s, %s, NOW(), NOW())
                """
        cursor.execute(query, (service_option, price))
        db.commit()
        response = {
                'message': 'New service added.'
            }
        return jsonify(response), 200

# Added by Percy
@app.route("/getAllServicesInfo", methods=['GET'])
@jwt_required() #new line, requires token to access /profile
def getAllServicesInfo():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    with db.cursor() as cursor:
        query = """SELECT option_id, description, price FROM service_options"""
        cursor.execute(query)
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Error retrieving services'
            }
            return jsonify(response), 200
        print(results)
        return jsonify(results), 200
    
    return

@app.route("/inventoryInStock", methods=['GET'])
def inventoryInStock():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search_query = request.args.get('searchQuery', None)

    # Determine the sort order based on the presence of 'asc' or 'desc' in the search query
    if 'asc' in search_query.lower():
        sort_order = 'asc'
    elif 'desc' in search_query.lower():
        sort_order = 'desc'
    else:
        sort_order = 'desc'  # Default to descending if no specific sort order is indicated

    offset = (page - 1) * limit
    query_params = ['InStock']
    sql = """SELECT i.vin, c.make, c.model, c.year, cd.price, cd.exterior_color, cd.interior_color, 
                     cd.wheel_drive, cd.mileage, cd.transmission, cd.seats
             FROM inventory i
             JOIN cars c ON c.car_id = i.car_id
             JOIN car_details cd ON cd.vin = i.vin
             WHERE i.status = %s"""

    if search_query:
        # Modify search query to exclude 'asc' or 'desc' keywords
        modified_search_query = search_query.replace('asc', '').replace('desc', '').strip()
        sql += " AND (c.make LIKE %s OR c.model LIKE %s OR c.year LIKE %s)"
        like_param = f"%{modified_search_query}%"
        query_params.extend([like_param, like_param, like_param])

    sql += f" ORDER BY cd.price {sort_order}"
    sql += " LIMIT %s OFFSET %s;"
    query_params.extend([limit, offset])

    with db.cursor() as cursor:
        cursor.execute(sql, query_params)
        results = cursor.fetchall()

    db.close()
    return jsonify({"inStockInventory": results})



@app.route("/carDetails", methods=['POST'])
def carDetails():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    carID = data.get('carID')
    with db.cursor() as cursor:
        sql = """Select i.vin, c.make, c.model, c.year,
                        cd.price, cd.exterior_color, cd.interior_color, 
                        cd.wheel_drive, cd.mileage, cd.transmission, cd.seats
                FROM inventory i
                    LEFT JOIN cars c on c.car_id = i.car_id
                    LEFT JOIN car_details cd on cd.vin = i.vin
                WHERE c.car_id = %s;"""
        cursor.execute(sql, ([carID]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"carDetails": []})
        return jsonify({"carDetails": results})
    


@app.route("/userInfo", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def userInfo():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """SELECT u.user_id, j.job_title, u.phone_number, u.first_name, u.last_name, a.username, a.email
                    FROM users u
                        LEFT JOIN jobs j on j.job_id = u.job_id
                        LEFT JOIN authentication a on a.user_id = u.user_id
                    WHERE u.user_id = %s"""
        cursor.execute(query, ([userID]))
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Error retrieving customer'
            }
            return jsonify(response), 200

    return jsonify({"inStockInventory": results})




@app.route("/addUser", methods=['POST'])
def addUser():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    username = data.get('username')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    job = data.get('job')
    password = data.get('password')

    user_id = 0
    job_id = 0

    # Check if email already exists
    with db.cursor() as cursor:
        query = """SELECT * 
                    FROM authentication WHERE email = %s"""
        cursor.execute(query, ([email]))
        results = cursor.fetchall()
        if results:
            response = {
                'message': 'Email Already Exists'
            }
            return jsonify(response), 200
        
    # Check if username already exists
    with db.cursor() as cursor:
        query = """SELECT * 
                    FROM authentication WHERE username = %s"""
        cursor.execute(query, ([username]))
        results = cursor.fetchall()
        if results:
            response = {
                'message': 'Username Already Exists'
            }
            return jsonify(response), 200
        
    # Check if phone number already exists
    with db.cursor() as cursor:
        query = """SELECT * 
                    FROM users WHERE phone_number = %s"""
        cursor.execute(query, ([phone_number]))
        results = cursor.fetchall()
        if results:
            response = {
                'message': 'Phone Number Already Exists'
            }
            return jsonify(response), 200

    # get job_id
    with db.cursor() as cursor:
        query = "SELECT * FROM jobs WHERE job_title = %s"
        cursor.execute(query, ([job]))
        results = cursor.fetchall()
        #print("RESULTS: ", results, " AND I THINK JOB_ID IS: ", results[0][0])
        job_id = results[0][0]

    # insert into users
    with db.cursor() as cursor:
        query = """
                INSERT INTO users (job_id, phone_number, first_name, last_name, insert_date, update_date) VALUES 
                                    (%s, %s, %s, %s, NOW(), NOW())
                """
        cursor.execute(query, (job_id, phone_number, first_name, last_name))
        db.commit()
        
    # insert into authentication
    with db.cursor() as cursor:
        query = "SELECT * FROM users WHERE phone_number = %s"
        cursor.execute(query, ([phone_number]))
        results = cursor.fetchall()
        user_id = results[0][0]

        query = """
                INSERT INTO authentication (user_id, username, email, password, insert_date, update_date) VALUES 
                                    (%s, %s, %s, %s, NOW(), NOW())
                """
        cursor.execute(query, (user_id, username, email, password))
        db.commit()

    response = {
        'message': 'User added successfully',
        'user_id': user_id
    }
    return jsonify(response), 200



@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response




@app.route("/authenticate", methods=['POST'])
def authenticate():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user_id = 0
    job_title = ""

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """SELECT a.user_id, j.job_title FROM authentication as a LEFT JOIN users as u ON a.user_id = u.user_id LEFT JOIN jobs AS j ON j.job_id = u.job_id WHERE username = %s AND password = %s"""
        cursor.execute(query, ([username], [password]))
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Incorrect username or password'
            }
            return jsonify(response), 200
        user_id = results[0][0]
        job_title = results[0][1]
    access_token = create_access_token(identity=username)

    response = {
        'message': 'Authentication successful',
        'user_id': user_id,
        'job_title': job_title,
        'access_token': access_token
    }
    return jsonify(response), 200




@app.route('/profile', methods=['GET'])
@jwt_required() #new line, requires token to access /profile

def my_profile():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userid = data.get('userid')

    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response




@app.route("/myGarageInv", methods=['POST'])
@jwt_required()
def myGarageInv():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    custID = data.get('custID')
    with db.cursor() as cursor:
        sql = """Select g.cust_id, g.vin, c.make, c.model, c.year
                FROM mygarage g
                    LEFT JOIN cars c on c.car_id = g.car_id
                WHERE g.cust_id = %s;"""
        print(sql,([custID]))
        cursor.execute(sql, ([custID]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"myGarageInv": []})
        return jsonify({"myGarageInv": results})
    
#returns all car makes in db
@app.route("/allmake")
@jwt_required() #new line, requires token to access /profile
def allMake():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    with db.cursor() as cursor:
        sql = """select distinct make from cars ;"""
        cursor.execute(sql)
        results = cursor.fetchall()
        if not results:
            return jsonify({"makes": []})
        return jsonify({"makes": results})
#recieves make and returns model related to that make
@app.route("/maketomodel" , methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def makeToModel():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    make = data.get('make')
    with db.cursor() as cursor:
        sql = """Select distinct model
                FROM cars
                where make= %s;"""
        print(sql,([make]))
        cursor.execute(sql, ([make]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"models": []})
        return jsonify({"models": results})
#recieves model and returns year that is related to that model
@app.route("/modeltoyear" , methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def modelToYear():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    model = data.get('model')
    with db.cursor() as cursor:
        sql = """Select year
                FROM cars
                where model= %s;"""
        print(sql,([model]))
        cursor.execute(sql, ([model]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"years": []})
        return jsonify({"years": results})


@app.route("/myGarageAddCar", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def myGarageAddCar():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    custID = data.get('custID')
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')
    vin = data.get('vin')

    with db.cursor() as cursor:
        query = """SELECT car_id
                    FROM cars WHERE make = %s AND model = %s AND year = %s"""
        cursor.execute(query, ([make], [model], [year]))
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Error retrieving car_id'
            }
            return jsonify(response), 200
        carID = results[0][0]

        query = """
                INSERT INTO mygarage (cust_id, vin, car_id, insert_date, update_date) VALUES 
                                    (%s, %s, %s, NOW(), NOW())
                """
        cursor.execute(query, (custID, vin, carID))
        db.commit()

    response = {
        'message': 'Car Added to My Garage'
    }
    return jsonify(response), 200



@app.route("/carPurchaseHistory", methods=['POST'])
#@jwt_required() #new line, requires token to access /profile
def carPurchaseHistory():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    print("RECEIVED USER ID: ", userID)
    with db.cursor() as cursor:
        query = """SELECT c.make, c.model, c.year, cs.vin, cs.insert_date, n.price, cs.financeOrCash, sales_id
                    FROM users u
                        LEFT JOIN car_sales cs on cs.user_id = u.user_id
                        LEFT JOIN inventory i on i.vin = cs.vin
                        LEFT JOIN cars c on c.car_id = i.car_id
                        LEFT JOIN negotiation n on n.vin = cs.vin
                    WHERE u.user_id = %s"""
        cursor.execute(query, ([userID]))
        results = cursor.fetchall()
        print("RESULTS for carPurchaseHistory: ", results)
        if not results:
            response = {
                'message': 'Error retrieving customer car purchases'
            }
            return jsonify(response), 200
        modified_results = []
        for i in results:
            my_dict = {}
            my_dict["c_make"] = i[0]
            my_dict["c_model"] = i[1]
            my_dict["c_year"] = i[2]
            my_dict["c_vin"] = i[3]
            my_dict["insert_date"] = i[4]
            my_dict["negotiation_price"] = i[5]
            my_dict["financeOrCash"] = i[6]
            my_dict["saleId"]=i[7]
            modified_results.append(my_dict)

    return jsonify({"carPurchaseHistory": modified_results}) # return jsonify({"carPurchaseHistory": results})



@app.route("/productPurchaseHistory", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def productPurchaseHistory():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')

    with db.cursor() as cursor:
        query = """SELECT p.product_name, p.price, p.description, ps.insert_date
                    FROM users u
                        LEFT JOIN product_sales ps on ps.customer_id = u.user_id
                        LEFT JOIN products p on p.product_id = ps.product_id
                    WHERE u.user_id = %s""" # LEFT JOIN product_sales ps on ps.user_id = u.user_id
        cursor.execute(query, ([userID]))
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Error retrieving customer product purchases'
            }
            return jsonify(response), 200
        modified_results = []
        for i in results:
            my_dict = {}
            my_dict["p_name"] = i[0]
            my_dict["p_price"] = i[1]
            my_dict["p_description"] = i[2]
            my_dict["insert_date"] = i[3]
            modified_results.append(my_dict)

    return jsonify({"productPurchaseHistory": modified_results}) # return jsonify({"productPurchaseHistory": results})



# modified by Percy
@app.route("/updateUserInfo", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def updateUserInfo():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    email = data.get('email')
    phoneNumber = data.get('phoneNumber')

    with db.cursor() as cursor:
        query = """SELECT * FROM users WHERE phone_number = %s"""
        cursor.execute(query, ([phoneNumber],))
        results = cursor.fetchall()
        if (results):
            response = {
                'message': 'This phone provided is already associated with an account. Try again.'
            }
            return jsonify(response)
        
        query = """SELECT * FROM users WHERE email = %s"""
        cursor.execute(query, ([email],))
        results = cursor.fetchall()
        if (results):
            response = {
                'message': 'This email provided is already associated with an account. Try again.'
            }
            return jsonify(response)
        
        query = """UPDATE users
                    SET first_name = %s, last_name = %s, phone_number = %s
                    WHERE user_id = %s """
        cursor.execute(query, ([firstName], [lastName], [phoneNumber], [userID]))
        db.commit()
        
        query = """UPDATE authentication
                    SET email = %s
                    WHERE user_id = %s """
        cursor.execute(query, ([email], [userID]))
        db.commit()

    response = {
        'message': 'Successfully updated Customer Information'
    }
    return jsonify(response), 200



@app.route("/addFavorite", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def addFavorite():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    custID = data.get('custID')
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """SELECT car_id
                    FROM cars WHERE make = %s AND model = %s AND year = %s"""
        cursor.execute(query, ([make], [model], [year]))
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Error retrieving car_id'
            }
            return jsonify(response), 200
        carID = results[0][0]

        query = """
                INSERT INTO favorites (user_id, car_id, insert_date, update_date) VALUES 
                                    (%s, %s, NOW(), NOW())
                """
        cursor.execute(query, (custID, carID))
        db.commit()

    response = {
        'message': 'Car added to Favorites'
    }
    return jsonify(response), 200

@app.route("/checkFavorite", methods=['POST'])
def checkFavorite():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    custID = data.get('custID')
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')

    with db.cursor() as cursor:
        query = """
                SELECT car_id FROM cars WHERE make = %s AND model = %s AND year = %s
                """
        cursor.execute(query, (make, model, year))
        results = cursor.fetchall()

        if not results:
            return jsonify({'isFavorited': False}), 200

        carID = results[0][0]

        query = """
                SELECT 1 FROM favorites WHERE user_id = %s AND car_id = %s
                """
        cursor.execute(query, (custID, carID))
        favorited = cursor.fetchone()
        
        return jsonify({'isFavorited': bool(favorited)}), 200


@app.route("/delFavorite", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def delFavorite():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    custID = data.get('custID')
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """SELECT car_id
                    FROM cars WHERE make = %s AND model = %s AND year = %s"""
        cursor.execute(query, ([make], [model], [year]))
        results = cursor.fetchall()
        if not results:
            response = {
                'message': 'Error retrieving car_id'
            }
            return jsonify(response), 200
        carID = results[0][0]

        query = """
                DELETE FROM favorites WHERE user_id = %s AND car_id = %s
                """
        cursor.execute(query, (custID, carID))
        db.commit()

    response = {
        'message': 'Car deleted from Favorites'
    }
    return jsonify(response), 200



@app.route("/favoriteCars", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def favoriteCars():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
        sql = """
            SELECT c.car_id, c.make, c.model, c.year, cd.mileage, cd.vin
            FROM favorites f
                JOIN cars c ON c.car_id = f.car_id
                JOIN inventory i ON i.car_id = c.car_id
                JOIN car_details cd ON cd.vin = i.vin
            WHERE f.user_id = %s;
        """
        cursor.execute(sql, userID)  # No need for a list if you're passing just one parameter
        results = cursor.fetchall()
        if not results:
            return jsonify({"favoriteCars": []})
        return jsonify({"favoriteCars": results})


@app.route("/createAccount", methods=['POST'])
@jwt_required()
def create_account():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    username = data.get('username')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    phone_number = data.get('phoneNumber')
    job_id = int(data.get('jobId'))
    password = data.get('password')  # No hashing done

    # Validate job_id for Technician (2) or Manager (3)
    if job_id not in [2, 3]:
        return jsonify({"error": "Invalid job ID. Only Manager or Technician can be created."}), 400

    # Check if email, username, or phone number already exists
    with db.cursor() as cursor:
        queries = {
            "email": "SELECT 1 FROM authentication WHERE email = %s",
            "username": "SELECT 1 FROM authentication WHERE username = %s",
            "phone_number": "SELECT 1 FROM users WHERE phone_number = %s"
        }
        for key, query in queries.items():
            cursor.execute(query, (data.get(key),))
            if cursor.fetchone():
                return jsonify({"error": f"{key.capitalize()} already exists."}), 400

    try:
        with db.cursor() as cursor:
            # Insert into users table
            user_sql = """
                INSERT INTO users (job_id, phone_number, first_name, last_name, insert_date, update_date)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """
            cursor.execute(user_sql, (job_id, phone_number, first_name, last_name))
            user_id = cursor.lastrowid

            # Insert into authentication table
            auth_sql = """
                INSERT INTO authentication (user_id, username, email, password, insert_date, update_date)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """
            cursor.execute(auth_sql, (user_id, username, email, password))  # Store the plain password
            db.commit()

        return jsonify({"message": "Account created successfully", "user_id": user_id}), 201
    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


    
@app.route('/getUsers', methods=['GET'])
@jwt_required()
def get_users():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB, cursorclass=pymysql.cursors.DictCursor)
    try:
        with db.cursor() as cursor:
            query = """
            SELECT u.user_id, u.first_name, u.last_name, u.phone_number, j.job_title as role, a.username, a.email
            FROM users u
            JOIN jobs j ON u.job_id = j.job_id
            JOIN authentication a ON u.user_id = a.user_id
            """
            cursor.execute(query)
            users = cursor.fetchall()
        return jsonify({'users': users}), 200
    finally:
        db.close()


@app.route('/deleteUser/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    try:
        with db.cursor() as cursor:
            # Delete user authentication details first to maintain referential integrity
            cursor.execute("DELETE FROM authentication WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
            db.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/updateUser/<int:user_id>', methods=['POST'])
@jwt_required()
def update_user(user_id):
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    job_id = data.get('job_id')
    if not job_id:
        return jsonify({'error': 'Job ID is required'}), 400

    try:
        with db.cursor() as cursor:
            user_update_sql = """
            UPDATE users SET 
            first_name = %s, last_name = %s, phone_number = %s, job_id = %s
            WHERE user_id = %s
            """
            cursor.execute(user_update_sql, (data['first_name'], data['last_name'], data['phone_number'], job_id, user_id))

            auth_update_sql = """
            UPDATE authentication SET 
            username = %s, email = %s
            WHERE user_id = %s
            """
            cursor.execute(auth_update_sql, (data['username'], data['email'], user_id))
            db.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()








@app.route("/checkCarInInv", methods=['POST'])
def checkCarInInv():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('custID')

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """SELECT *
                    FROM inventory WHERE vin = %s"""
        cursor.execute(query, ([vin]))
        results = cursor.fetchall()
    if not results:
        response = {
            'message': '0' #Car not found
        }
    else:
        response = {
            'message': '1' #Car found
        }
    return jsonify(response), 200

@app.route("/scheduleTestDriveAppt", methods=['POST'])

def scheduleTestDriveAppt():
    try:
        db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
        data = request.get_json()

        custID = data.get('custID')
        datetime = data.get('datetime')

        # Basic validation (You might want more robust checks here)
        if not custID or not datetime:
            return jsonify({'message': 'Missing custID or datetime'}), 400

        with db.cursor() as cursor:
            query = """
                    INSERT INTO test_drive_appointments (user_id, scheduled_date, status, site_id, insert_date, update_date)
                    VALUES (%s, %s, 'scheduled', %s, NOW(), NOW())
                    """
            cursor.execute(query, (custID, datetime, 1))
            db.commit()

        return jsonify({'message': 'Appointment Scheduled'}), 200
    except MySQLError as e:
        # Log the error and respond with a server error message
        print(f"Database error: {e}")
        return jsonify({'message': 'Database error occurred'}), 500
    finally:
        db.close()





@app.route("/rescheduleTestDriveAppt", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def rescheduleTestDriveAppt():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    apptID = data.get('apptID')
    datetime = data.get('datetime')

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """
                UPDATE test_drive_appointments
                SET scheduled_date = %s
                WHERE appt_id = %s;
                """
        cursor.execute(query, ([datetime], [apptID]))
        db.commit()

    response = {
        'message': 'Appointment rescheduled'
    }
    return jsonify(response), 200


 
# returns available times for a specific date
@app.route("/availableTestDriveTimes", methods=['POST'])
@jwt_required()  # Requires a valid JWT token to access
def availableTestDriveTimes():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    date = data.get('date')

    start_time = datetime.strptime(date, '%Y-%m-%d').replace(hour=9, minute=0)
    end_time = datetime.strptime(date, '%Y-%m-%d').replace(hour=17, minute=0)
    available_times = [start_time + timedelta(minutes=20 * i) for i in range((end_time - start_time) // timedelta(minutes=20))]

    with db.cursor() as cursor:
        sql = """SELECT CAST(CAST(scheduled_date AS TIME) AS CHAR)
                 FROM test_drive_appointments
                 WHERE CAST(CAST(scheduled_date AS DATE) AS CHAR) = %s;"""
        cursor.execute(sql, (date,))
        results = cursor.fetchall()
        unavailable_times = [time[0] for time in results]

    available_times = [time.strftime('%H:%M:%S') for time in available_times if time.strftime('%H:%M:%S') not in unavailable_times]
    db.close()
    return jsonify({"availableTimes": available_times})



@app.route("/cancelTestDriveAppt", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def cancelTestDriveAppt():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    apptID = data.get('apptID')
    with db.cursor() as cursor:
        query = """UPDATE test_drive_appointments
                    SET status = %s
                    WHERE appt_id = %s"""
        cursor.execute(query, (['canceled'], [apptID]))
        db.commit()
        return jsonify({"testDriveAppt": "Appointment canceled"})
    
@app.route("/scheduleServiceAppt", methods=['POST'])
@jwt_required()  # Requires token to access
def addServiceAppt():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    vin = data.get('vin')
    serviceOption = data.get('serviceOption')
    serviceDate = data.get('serviceDate')
    number = data.get('cardNumber')
    sec_code = data.get('cvc')
    exp_date = data.get('expiryDate')

    with db.cursor() as cursor:
        # Get service option ID and price
        query = "SELECT option_id, price FROM service_options WHERE description = %s"
        cursor.execute(query, (serviceOption,))
        result = cursor.fetchone()
        if not result:
            return jsonify({'message': 'Error retrieving serviceOptionID'}), 200
        serviceOptionID, base_price = result

        # Check if warranty covers this service
        query = """
            SELECT COUNT(*) FROM carWarranty WHERE vin = %s AND option_id = %s
            """
        cursor.execute(query, (vin, serviceOptionID))
        warranty_covered = cursor.fetchone()[0] > 0

        # Calculate total price based on warranty coverage
        total_price = 0 if warranty_covered else base_price

        # Processes payment first
        query = """
            INSERT INTO credit_card_history (user_id, cardholdername, number, sec_code, exp_date, insert_date, update_date)
            VALUES (%s, NULL, %s, %s, %s, NOW(), NOW())
            """
        cursor.execute(query, (userID, number, sec_code, exp_date))
        db.commit()

        # Get last four digits of the card
        last_four_digits = number[-4:]

        # Then schedules appointment
        query = """
            INSERT INTO service_appointments (vin, user_id, scheduled_date, service_option_id, status, ticket_status_id, site_id, insert_date, update_date)
            VALUES (%s, %s, %s, %s, 'scheduled', 1, 1, NOW(), NOW())
            """
        cursor.execute(query, (vin, userID, serviceDate, serviceOptionID))
        appointment_id = cursor.lastrowid
        db.commit()

        # Record the service sale
        query = """
            INSERT INTO service_sales (service_appointment_id, user_id, service_option_id, price, card_last_four, insert_date, update_date)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """
        cursor.execute(query, (appointment_id, userID, serviceOptionID, total_price, last_four_digits))
        db.commit()

    return jsonify({'message': 'Appointment Scheduled and Payment Recorded'}), 200

# modified by Percy
@app.route("/availableServiceTimes", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def availableServiceTimes():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    date = data.get('date')
    #print("DATE IS: ", date)
    start_time = datetime.strptime(date, '%Y-%m-%d').replace(hour=9, minute=0)
    end_time = datetime.strptime(date, '%Y-%m-%d').replace(hour=17, minute=0)
    
    # Generate all possible time slots (9am-5pm)
    available_times = []
    current_time = start_time
    while current_time < end_time:
        available_times.append(str(current_time.strftime('%H:%M:%S'))) # casted result as a string
        current_time += timedelta(minutes=20)
    #print("The initial available times array is: ", available_times)
    
    with db.cursor() as cursor:
        sql = """SELECT CAST(CAST(scheduled_date AS TIME) AS CHAR)
                 FROM service_appointments
                 WHERE CAST(CAST(scheduled_date AS DATE) AS CHAR) = %s;"""
        cursor.execute(sql, (date,))
        results = cursor.fetchall()
        unavailable_times = []
        #print("Length of results: ", len(results))
        # Extract times from results
        if (len(results) > 0):
            unavailable_times = [time[0] for time in results]
        #print("After populating unavailable times: ", unavailable_times)
        # Filter out unavailable times
        available_times = [time for time in available_times if time not in unavailable_times]
        
        return jsonify({"availableTimes": available_times})



@app.route("/addCard", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def addCard():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    custID = data.get('custID')
    cardNum = data.get('cardNum')
    cardHolderName = data.get('cardHolderName')
    cvc = data.get('cvc')
    expDate = data.get('expDate')

    # Check if username and password is valid
    with db.cursor() as cursor:
        query = """
                INSERT INTO credit_card_history (user_id, cardholdername, number, sec_code, exp_date, insert_date, update_date)
                                    VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                """
        cursor.execute(query, ([custID], [cardHolderName], [cardNum], [cvc], [expDate]))
        db.commit()

    response = {
        'message': 'Card Added'
    }
    return jsonify(response), 200




@app.route("/myCart", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def myCart():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    with db.cursor() as cursor:
        sql = """Select c.product_id, p.product_name, c.quantity, p.price, p.description
                FROM cart c
                    LEFT JOIN products p on p.product_id = c.product_id
                WHERE c.user_id = %s;"""
        cursor.execute(sql, ([userID]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"myCart": []})
        return jsonify({"myCart": results})
    



@app.route("/changeQuantity", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def changeQuantity():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    quantity = data.get('quantity')
    productID = data.get('productID')
    with db.cursor() as cursor:
        if quantity == 0:
            query = """DELETE FROM myCart
                        WHERE product_id = %s AND user_id = %s"""
            cursor.execute(query, ([productID], [userID]))
            db.commit()
            return jsonify({"myCart": "Product deleted from cart"})
        else:
            query = """UPDATE myCart
                        SET quantity = %s
                        WHERE product_id = %s AND user_id = %s"""
            cursor.execute(query, ([quantity], [productID], [userID]))
            db.commit()
            return jsonify({"myCart": "Product quantity updated"})
    


@app.route("/testDriveAppts", methods=['GET'])
@jwt_required() #new line, requires token to access /profile

def testDriveAppts():
    print("Arrived here")
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    with db.cursor() as cursor:
        sql = """Select u.user_id, u.first_name, u.last_name, 
                        t.appt_id, t.scheduled_date, t.status
                FROM test_drive_appointments t
                    LEFT JOIN users u on u.user_id = t.user_id;"""
        cursor.execute(sql)
        results = cursor.fetchall()
        if not results:
            return jsonify({"testDriveAppts": []})
        # modified by percy
        modified_results = []
        for i in results:
            my_dict = {}
            my_dict["user_id"] = i[0]
            my_dict["first_name"] = i[1]
            my_dict["last_name"] = i[2]
            my_dict["appt_id"] = i[3]
            my_dict["scheduled_date"] = i[4]
            my_dict["status"] = i[5]
            modified_results.append(my_dict)

        return jsonify({"testDriveAppts": modified_results}) # return jsonify({"testDriveAppts": results})
    


@app.route("/negotiation", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def negotiation():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    managerID = data.get('managerID')
    print("Manager id is: ", managerID)
    with db.cursor() as cursor:
        query = """Select u.user_id, u.first_name, u.last_name, 
                        n.vin, n.price, n.insert_date
                FROM negotiation n
                    LEFT JOIN users u on u.user_id = n.cust_id
                WHERE manager_id = %s;"""
        cursor.execute(query, ([managerID]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"negotiation": []})
        # modified by percy
        modified_results = []
        for i in results:
            my_dict = {}
            my_dict["user_id"] = i[0]
            my_dict["first_name"] = i[1]
            my_dict["last_name"] = i[2]
            my_dict["vin"] = i[3]
            my_dict["price"] = i[4]
            my_dict["insert_date"] = i[5]
            modified_results.append(my_dict)

        return jsonify({"negotiation": modified_results}) # return jsonify({"negotiation": results})
    

    

@app.route("/negotiationSale", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def negotiationSale():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    saleID = data.get('saleID')
    with db.cursor() as cursor:
        query = """Select u.user_id, u.first_name, u.last_name, 
                        cs.vin, c.make, c.model, c.year, cs.insert_date,
                        n.price
                FROM car_sales cs
                    LEFT JOIN inventory i on i.vin = cs.vin
                    LEFT JOIN cars c on c.car_id = i.car_id
                    LEFT JOIN users u on u.user_id = cs.user_id
                    LEFT JOIN negotiation n on n.vin = cs.vin
                WHERE cs.sales_id = %s;"""
        cursor.execute(query, ([saleID]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"negotiationSale": []})
        # modified by percy
        modified_results = []
        for i in results:
            my_dict = {}
            my_dict["user_id"] = i[0]
            my_dict["first_name"] = i[1]
            my_dict["last_name"] = i[2]
            my_dict["vin"] = i[3]
            my_dict["make"] = i[4]
            my_dict["model"] = i[5]
            my_dict["year"] = i[6]
            my_dict["insert_date"] = i[7]
            my_dict["price"] = i[8]
            modified_results.append(my_dict)

        return jsonify({"negotiationSale": modified_results}) # return jsonify({"negotiationSale": results})



@app.route("/vehicleDetails/<vin>", methods=['GET'])

def vehicleDetailsByVin(vin):
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
            sql = """
                SELECT 
                    i.vin, 
                    c.make, 
                    c.model, 
                    c.year, 
                    cd.price, 
                    cd.exterior_color, 
                    cd.interior_color, 
                    cd.wheel_drive, 
                    cd.mileage, 
                    cd.transmission, 
                    cd.seats,
                    cd.engine,
                    cd.keys_given,
                    cd.tax  # Add other fields as needed
                FROM 
                    inventory i
                LEFT JOIN 
                    cars c ON c.car_id = i.car_id
                LEFT JOIN 
                    car_details cd ON cd.vin = i.vin
                WHERE 
                    i.vin = %s;
            """
            cursor.execute(sql, (vin,))
            result = cursor.fetchone()

            if result is None:
                return jsonify({"error": "Vehicle not found"}), 404

            # You could further process the result here if needed

    except Exception as e:
        return jsonify({"error": "Error fetching vehicle details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"carDetails": result})


@app.route("/currentappointments", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def cuurentAppointments():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
            sql = """
select appt_id, sa.vin, scheduled_date,sa.status as appointment,description, price,ts.status as ticket, make, model, year  from 
service_appointments as sa 
left join service_options as so on sa.service_option_id = so.option_id 
left join ticket_status as ts on sa.ticket_status_id = ts.status_id
left join mygarage as mg on sa.vin = mg.vin
left join cars as c on c.car_id = mg.car_id
where user_id=%s and scheduled_date >= date(now());
            """
            cursor.execute(sql, (userID))
            result = cursor.fetchall()

            if result is None:
                return jsonify({"error": "current appointments not found"}), 404

            # You could further process the result here if needed

    except Exception as e:
        return jsonify({"error": "Error fetching appointments details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"appointments": result})


@app.route("/historyappointments", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def historyAppointments():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
            sql = """
select appt_id, sa.vin, scheduled_date,sa.status as appointment,description, price,ts.status, make, model, year  from 
service_appointments as sa 
left join service_options as so on sa.service_option_id = so.option_id 
left join ticket_status as ts on sa.ticket_status_id = ts.status_id
left join mygarage as mg on sa.vin = mg.vin
left join cars as c on c.car_id = mg.car_id
where user_id=%s and scheduled_date < date(now());
            """
            cursor.execute(sql, (userID))
            result = cursor.fetchall()

            if result is None:
                return jsonify({"error": "appointments history not found"}), 404

            # You could further process the result here if needed

    except Exception as e:
        return jsonify({"error": "Error fetching appointments details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"appointments": result})

@app.route("/currtestdrive", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def currtestdrive():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
            sql = """
select *  from 
test_drive_appointments as ta 
where user_id=%s and status = 'created' or status='scheduled';
            """
            cursor.execute(sql, (userID))
            result = cursor.fetchall()

            if result is None:
                return jsonify({"error": "appointments not found"}), 404

            # You could further process the result here if needed

    except Exception as e:
        return jsonify({"error": "Error fetching appointments details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"appointments": result})


@app.route("/pasttestdrive", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def pasttestdrive():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    userID = data.get('userID')
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
            sql = """
select *  from 
test_drive_appointments as ta 
where user_id=%s and status != 'created' and status != 'scheduled';
            """
            cursor.execute(sql, (userID))
            result = cursor.fetchall()

            if result is None:
                return jsonify({"error": "appointments history not found"}), 404

            # You could further process the result here if needed

    except Exception as e:
        return jsonify({"error": "Error fetching appointments details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"appointments": result})


@app.route("/invManage", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def invManage():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    with db.cursor() as cursor:
        sql = """Select i.vin, c.car_id, c.make, c.model, c.year,
                        cd.price, cd.exterior_color, cd.interior_color, 
                        cd.wheel_drive, cd.mileage, cd.transmission, cd.seats
                FROM inventory i
                    LEFT JOIN cars c on c.car_id = i.car_id
                    LEFT JOIN car_details cd on cd.vin = i.vin
                WHERE i.vin = %s;"""
        cursor.execute(sql, ([vin]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"carDetails": []})
        response={
            "vin": results[0][0],
            "car_id": results[0][1],
            "make": results[0][2],
            "model": results[0][3],
            "year": results[0][4],
            "price": results[0][5],
            "exterior_color": results[0][6],
            "interior_color": results[0][7],
            "wheel_drive": results[0][8],
            "mileage": results[0][9],
            "transmission": results[0][10],
            "seats": results[0][11],
        }
        return jsonify({"carDetails": response})
    


@app.route("/openTickets", methods=['GET'])

def openTickets():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    with db.cursor() as cursor:
        sql = """Select s.appt_id, s.vin, s.user_id, s.assignedTo, s.scheduled_date,
                        o.description, o.price, s.status as service_status, 
                        t.status as ticket_status, s.message, s.insert_date, s.update_date 
                FROM service_appointments s
                    LEFT JOIN service_options o ON o.option_id = s.service_option_id
                    LEFT JOIN ticket_status t ON t.status_id = s.ticket_status_id
                WHERE t.status_id = 1 AND assignedTo IS NULL"""
        cursor.execute(sql)
        results = cursor.fetchall()
        if not results:
            return jsonify({"openTickets": []})
        return jsonify({"openTickets": results})



@app.route("/openTechTickets", methods=['POST'])

def openTechTickets():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    tech_id = data.get('tech_id')
    with db.cursor() as cursor:
        sql = """
Select s.appt_id, s.vin, s.user_id, s.assignedTo, s.scheduled_date,
                        o.description, o.price, s.status as service_status, make, model, year,
                        t.status as ticket_status, s.message, s.insert_date, s.update_date , u.first_name, u.last_name,
                        s.ticket_status_id
                FROM service_appointments s
                    LEFT JOIN service_options o ON o.option_id = s.service_option_id
                    LEFT JOIN ticket_status t ON t.status_id = s.ticket_status_id
                    LEFT JOIN mygarage mg ON mg.vin = s.vin
                    left join cars c on mg.car_id = c.car_id
                    left join users u on s.user_id = u.user_id
                WHERE assignedTo = %s
                    AND t.status IN ('Started', 'In Progress');"""
        cursor.execute(sql, ([tech_id]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"openTechTickets": []})
        return jsonify({"openTechTickets": results})
    



@app.route("/closedTechTickets", methods=['POST'])

def closedTechTickets():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    tech_id = data.get('tech_id')
    with db.cursor() as cursor:
        sql = """Select s.appt_id, s.vin, s.user_id, s.assignedTo, s.scheduled_date,
                        o.description, o.price, s.status as service_status, make, model, year,
                        t.status as ticket_status, s.message, s.insert_date, s.update_date , u.first_name, u.last_name,
                        s.ticket_status_id
                FROM service_appointments s
                    LEFT JOIN service_options o ON o.option_id = s.service_option_id
                    LEFT JOIN ticket_status t ON t.status_id = s.ticket_status_id
                    LEFT JOIN mygarage mg ON mg.vin = s.vin
                    left join cars c on mg.car_id = c.car_id
                    left join users u on s.user_id = u.user_id
                WHERE assignedTo = %s
                    AND t.status IN ('Closed', 'Voided');"""
        cursor.execute(sql, ([tech_id]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"closedTechTickets": []})
        return jsonify({"closedTechTickets": results})



@app.route("/assigntech", methods=['POST'])
def startTicket():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    appt_id = data.get('apptID')
    tech_id = data.get('tech_id')

    
    try:
        with db.cursor() as cursor:
            # Update both technician assignment and update date in one query
            query = """
                UPDATE service_appointments
                SET assignedTo = %s, update_date = NOW(), ticket_status_id= 2
                WHERE appt_id = %s
            """
            cursor.execute(query, (tech_id, appt_id))
            db.commit()
            return jsonify({"TicketStatus": "Ticket Status Updated"}), 200
    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/updateTicketStatus", methods=['POST'])

def updateTicketStatus():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    appt_id = data.get('apptID')
    status_id = data.get('statusID')
    with db.cursor() as cursor:
        query = """UPDATE service_appointments
                    SET ticket_status_id = %s
                    WHERE appt_id = %s"""
        cursor.execute(query, ([status_id], [appt_id]))
        db.commit()
        query = """UPDATE service_appointments
                    SET update_date = NOW()
                    WHERE appt_id = %s"""
        cursor.execute(query, ([appt_id]))
        db.commit()
        db.close()
        return jsonify({"TicketStatus":"Ticket Status Updated"})
    

   
@app.route("/updateTicketMessage", methods=['POST'])

def updateTicketMessage():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    appt_id = data.get('apptID')
    message = data.get('message')
    with db.cursor() as cursor:
        query = """UPDATE service_appointments
                    SET message = %s
                    WHERE appt_id = %s"""
        cursor.execute(query, ([message], [appt_id]))
        db.commit()
        query = """UPDATE service_appointments
                    SET update_date = NOW()
                    WHERE appt_id = %s"""
        cursor.execute(query, ([appt_id]))
        db.commit()
        db.close()
        return jsonify({"TicketMessage":"Ticket Message Updated"})
    


# Used by Percy
@app.route("/insertCarModel", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def insertCarModel():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')
    with db.cursor() as cursor:
        query = """INSERT INTO cars
                   (make, model, year, insert_date, update_date) values
                    (%s, %s, %s, NOW(), NOW());"""
        cursor.execute(query, ([make], [model], [year]))
        db.commit()
        db.close()
        return jsonify({"Response":"Car model inserted"})
  


# Modified by Percy
@app.route("/insertCarDetails", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def insertCarDetails():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    price = data.get('price')
    ext_color = data.get('ext_color')
    int_color = data.get('int_color')
    wheel_drive = data.get('wheel_drive')
    mileage = data.get('mileage')
    transmission = data.get('transmission')
    seats = data.get('seats')
    keys = data.get('keys')
    tax = data.get('tax')
    engine = data.get('engine')
    with db.cursor() as cursor:
        query = """Select *
                    FROM car_details
                    where vin = %s"""
        cursor.execute(query, ([vin]))
        results = cursor.fetchall()
        if results:
            db.close()
            return jsonify({"Response":"Car VIN already exists"})
        else:
            query = """INSERT INTO car_details
                    (vin, price, exterior_color, interior_color, wheel_drive, mileage, transmission, seats, engine, keys_given, tax, insert_date, update_date) VALUES 
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW());"""
            cursor.execute(query, ([vin], [price], [ext_color], [int_color], [wheel_drive], [mileage], [transmission], [seats], [engine], [keys], [tax]))
            db.commit()
            db.close()
            return jsonify({"Response":"Car Details inserted"})




@app.route("/getCarDetails", methods=['POST'])
def getCarDetails():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')

    with db.cursor() as cursor:
        query = """Select price, exterior_color, interior_color, wheel_drive, mileage,
                            transmission,
                            seats,
                            engine,
                            keys_given,
                            tax,
                            vin
                    FROM car_details
                    where vin = %s"""
        cursor.execute(query, ([vin]))
        results = cursor.fetchall()
        if not results:
            db.close()
            return jsonify({"message":"Car VIN does not exist."})
        
        modified_results = []
        for i in results:
            my_dict = {}
            my_dict["price"] = i[0]
            my_dict["ext_color"] = i[1]
            my_dict["int_color"] = i[2]
            my_dict["wheel_drive"] = i[3]
            my_dict["mileage"] = i[4]
            my_dict["transmission"] = i[5]
            my_dict["seats"] = i[6]
            my_dict["engine"] = i[7]
            my_dict["keys_given"] = i[8]
            my_dict["tax"] = i[9]
            my_dict["vin"] = i[10]
            modified_results.append(my_dict)

        print(modified_results)
        return jsonify({"results": modified_results})

# Used by Percy
@app.route("/updateCarDetails", methods=['POST'])
@jwt_required() #new line, requires token to access /profile
def updateCarDetails():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    price = data.get('price')
    ext_color = data.get('ext_color')
    int_color = data.get('int_color')
    wheel_drive = data.get('wheel_drive')
    mileage = data.get('mileage')
    transmission = data.get('transmission')
    seats = data.get('seats')
    keys = data.get('keys')
    tax = data.get('tax')
    engine = data.get('engine')
    with db.cursor() as cursor:
        query = """Select *
                    FROM car_details
                    where vin = %s"""
        cursor.execute(query, ([vin]))
        results = cursor.fetchall()
        if not results:
            db.close()
            return jsonify({"Response":"Car VIN does not exists"})
        else:
            query = """UPDATE car_details
                        SET price = %s,
                            exterior_color = %s,
                            interior_color = %s,
                            wheel_drive = %s,
                            mileage = %s,
                            transmission = %s,
                            seats = %s,
                            engine = %s,
                            keys_given = %s,
                            tax = %s
                        WHERE vin = %s"""
            cursor.execute(query, ([price], [ext_color], [int_color], 
                                [wheel_drive], [mileage], [transmission], 
                                [seats], [engine], [keys], [tax], [vin]))
            db.commit()
            db.close()
            return jsonify({"Response":"Car Details Updated"})
  




@app.route("/customerServiceAppts", methods=['POST'])
@jwt_required() #new line, requires token to access /profile

def customerServiceAppts():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')
    with db.cursor() as cursor:
        sql = """Select s.appt_id, s.vin, s.user_id, s.assignedTo, s.scheduled_date,
                        o.description, o.price, s.status as service_status, 
                        s.message, s.insert_date, s.update_date 
                FROM service_appointments s
                    LEFT JOIN service_options o ON o.option_id = s.service_option_id
                WHERE user_id = %s 
                    AND s.status IN ('Scheduled');"""
        cursor.execute(sql, ([user_id]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"customerServiceAppts": []})
        return jsonify({"customerServiceAppts": results})
    




@app.route("/managerNegotiations", methods=['POST'])
def managerNegotiations():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('manager_user_id')
    with db.cursor() as cursor:
        sql = """Select n.vin, n.price, n.update_date,
                        u.first_name, u.last_name
                FROM negotiation n
                    LEFT JOIN users u on u.user_id = n.cust_id
                WHERE n.manager_id = %s;"""
        cursor.execute(sql, ([user_id]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"managerNegotiations": []})
        return jsonify({"managerNegotiations": results})




@app.route("/searchFirstName", methods=['POST'])
def searchFirstName():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    firstname = data.get('firstname')
    with db.cursor() as cursor:
        sql = """Select u.first_name, u.last_name, u.phone_number, 
                j.job_title, a.username, a.email, u.insert_date
                FROM users u
                    LEFT JOIN jobs j on j.job_id = u.job_id
                    LEFT JOIN authentication a on u.user_id = a.user_id
                WHERE u.first_name = %s;"""
        cursor.execute(sql, ([firstname]))
        results = cursor.fetchall()
        if not results:
            return jsonify({"searchFirstName": []})
        return jsonify({"searchFirstName": results})
    


@app.route("/add_sale_and_payment", methods=['POST'])
def add_sale_and_payment():
    # Establish database connection
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')
    sales_id = data.get('sales_id')
    price = data.get('price')
    financeOrCash = data.get('financeOrCash')
    vin = data.get('vin')

    try:
        with db.cursor() as cursor:
            # Insert into car_sales table
            sql_sales = """INSERT INTO car_sales (user_id, financeOrCash, vin, insert_date, update_date)
                           VALUES (%s, %s, %s, NOW(), NOW());"""
            cursor.execute(sql_sales, (user_id, financeOrCash, vin))
            sales_id = cursor.lastrowid  # Get the auto-generated sales_id

            # Insert into payments table
            sql_payment = """INSERT INTO payments (user_id, sales_id, price, insert_date, update_date)
                             VALUES (%s, %s, %s, NOW(), NOW());"""
            cursor.execute(sql_payment, (user_id, sales_id, price))

            # Commit changes to the database
            db.commit()

        return jsonify({"success": True, "message": "Sale and payment added successfully", "sales_id": sales_id}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()




@app.route("/monthSales", methods=['POST'])
def monthSales():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    month = data.get('month')
    year = data.get('year')
    with db.cursor(pymysql.cursors.DictCursor) as cursor:
        sql = """
            SELECT cs.sales_id, cs.financeOrCash, cs.vin, 
                cs.insert_date, COALESCE(n.price, cd.price) as price,
                u.first_name, u.last_name
            FROM car_sales cs
            LEFT JOIN negotiation n ON n.vin = cs.vin
            LEFT JOIN car_details cd ON cd.vin = cs.vin
            LEFT JOIN users u ON u.user_id = cs.user_id
            WHERE YEAR(cs.insert_date) = %s AND MONTH(cs.insert_date) = %s;
        """
        cursor.execute(sql, (year, month))
        results = cursor.fetchall()
    db.close()
    if not results:
        return jsonify({"monthSales": []}), 404
    return jsonify({"monthSales": results}), 200

    


@app.route("/monthPayments", methods=['POST'])
def monthPayments():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    month = data.get('month')
    year = data.get('year')
    with db.cursor(pymysql.cursors.DictCursor) as cursor:
        sql = """
            SELECT p.payment_id, p.price, p.insert_date,
                u.first_name, u.last_name
            FROM payments p
            LEFT JOIN users u ON u.user_id = p.user_id
            WHERE YEAR(p.insert_date) = %s AND MONTH(p.insert_date) = %s;
        """
        cursor.execute(sql, [year, month])
        results = cursor.fetchall()
    db.close()
    if not results:
        return jsonify({"monthPayments": []}), 404
    return jsonify({"monthPayments": results}), 200





@app.route("/vehicleDetailsManager", methods=['POST'])
def vehicleDetailsManager():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor to get results as dictionaries
            sql = """
                SELECT 
                    i.vin, 
                    c.make, 
                    c.model, 
                    c.year, 
                    cd.price, 
                    cd.exterior_color, 
                    cd.interior_color, 
                    cd.wheel_drive, 
                    cd.mileage, 
                    cd.transmission, 
                    cd.seats,
                    cd.engine,
                    cd.keys_given,
                    cd.tax 
                FROM 
                    inventory i
                LEFT JOIN 
                    cars c ON c.car_id = i.car_id
                LEFT JOIN 
                    car_details cd ON cd.vin = i.vin
                WHERE 
                    i.vin = %s;
            """
            cursor.execute(sql, (vin,))
            result = cursor.fetchall()

            if result is None:
                return jsonify({"error": "Vehicle not found"}), 404

    except Exception as e:
        return jsonify({"error": "Error fetching vehicle details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"carDetails": result})





@app.route("/insertCarInInv", methods=['POST'])
def insertCarInInv():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')
    try:
        # get car_id
        with db.cursor() as cursor:
            query = "SELECT car_id FROM cars WHERE make = %s and model = %s and year = %s"
            cursor.execute(query, ([make], [model], [year]))
            results = cursor.fetchall()
            if results is None:
                return jsonify({"error": "Car not found"}), 404
            car_id = results[0][0]

        # insert into users
        with db.cursor() as cursor:
            query = """
                    INSERT INTO inventory (vin, car_id, insert_date, update_date) VALUES 
                                        (%s, %s, NOW(), NOW())
                    """
            cursor.execute(query, (vin, car_id))
            db.commit()

    except Exception as e:
        return jsonify({"error": "Error fetching vehicle details", "message": str(e)}), 500
    finally:
        db.close()

    return jsonify({"Vehicle": "Vehicle inserted"})

@app.route('/proxy_check_credit_score', methods=['POST'])
def proxy_check_credit_score():
    data = request.get_json()
    ssn = data.get('ssn')

    if not ssn:
        return jsonify({"error": "Missing data: SSN"}), 400

    url = 'http://localhost:5001/check_credit_score'  # Adjusted f_stub endpoint URL

    try:
        response = requests.post(url, json={"ssn": ssn})
        response_data = response.json()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to communicate with f_stub service", "message": str(e)}), 500

    return jsonify(response_data), response.status_code


@app.route('/proxy_add_bank_account', methods=['POST'])
def proxy_add_bank_account():
    data = request.get_json()
    ssn = data.get('ssn')
    full_name = data.get('full_name')
    routing_number = data.get('routing_number')
    account_number = data.get('account_number')
    bank_name = data.get('bank')

    if not (ssn and routing_number and account_number):
        return jsonify({"error": "All fields are required"}), 400

    url = 'http://localhost:5001/create_or_update_account'  # Updated f_stub endpoint URL

    try:
        response = requests.post(url, json={
            "ssn": ssn, "bank_name": bank_name ,"routing_number": routing_number, "account_number": account_number, "full_name": full_name
        })
        response_data = response.json()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to communicate with f_stub service", "message": str(e)}), 500

    return jsonify(response_data), response.status_code


@app.route('/proxy_create_loan_and_payment', methods=['POST'])
def proxy_create_loan_and_payment():
    data = request.get_json()
    ssn = data.get('ssn')  # Use SSN to fetch user_id from the backend
    loan_amount = data.get('loan_amount')
    monthly_amount = data.get('monthly_amount')
    initial_payment_amount = data.get('initial_payment_amount')

    # Validation of input data
    if not (ssn and loan_amount and monthly_amount and initial_payment_amount):
        return jsonify({"error": "SSN and all loan and payment fields must be provided"}), 400

    # Endpoint URL of the actual loan and payment creation service on the backend server
    url = 'http://localhost:5001/create_loan_and_payment'

    try:
        # First, get the user_id from the backend using the SSN
        user_id_response = requests.get(f'http://localhost:5001/get_user_id_by_ssn', params={"ssn": ssn})
        user_id_data = user_id_response.json()
        if 'user_id' not in user_id_data:
            return jsonify({"error": "User not found with provided SSN"}), 404

        user_id = user_id_data['user_id']

        # Forwarding the request to create loan and payment
        response = requests.post(url, json={
            "ssn" : ssn,
            "user_id": user_id,
            "loan_amount": loan_amount,
            "monthly_amount": monthly_amount,
            "initial_payment_amount": initial_payment_amount
        })
        response_data = response.json()
    except requests.RequestException as e:
        # Handling communication errors with the backend service
        return jsonify({"error": "Failed to communicate with the backend service", "message": str(e)}), 500

    # Returning the response received from the backend service
    return jsonify(response_data), response.status_code


@app.route("/addCarWarranty", methods=['POST'])
def addCarWarranty():
    # Connect to the database
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    option_id = data.get('option_id')

    try:
        with db.cursor() as cursor:
            # SQL query to insert the new warranty
            query = """
                    INSERT INTO carWarranty (vin, option_id, insert_date, update_date)
                    VALUES (%s, %s, NOW(), NOW())
                    """
            cursor.execute(query, (vin, option_id))
            db.commit()  # Commit the transaction
            response = {'message': 'Warranty added successfully.'}
            return jsonify(response), 200
    except pymysql.MySQLError as e:
        db.rollback()  # Rollback in case of any error
        print(e)
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route("/get_ssn_by_user", methods=['POST'])
def get_ssn_by_user():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')

    try:
        with db.cursor() as cursor:
            sql = "SELECT ssn FROM users WHERE user_id = %s;"
            cursor.execute(sql, (user_id,))
            result = cursor.fetchone()
            if result:
                return jsonify({"ssn": result['ssn']}), 200
            else:
                return jsonify({"error": "User not found"}), 404
    finally:
        db.close()

@app.route("/verify_or_add_ssn", methods=['POST'])
def verify_or_add_ssn():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')
    ssn = data.get('ssn')

    try:
        with db.cursor() as cursor:
            sql = "SELECT ssn FROM users WHERE user_id = %s;"
            cursor.execute(sql, (user_id,))
            result = cursor.fetchone()
            
            if result is not None and result[0] is not None: 
                print(result)
                if result[0] == ssn:
                    return jsonify({"valid": True}), 200
                else:
                    return jsonify({"valid": False}), 200
            else:
                # No existing SSN found, so we update the record with the new SSN
                insert_sql = "UPDATE users SET ssn = %s WHERE user_id = %s;"
                cursor.execute(insert_sql, (ssn, user_id))
                db.commit()
                return jsonify({"valid": True, "message": "SSN added successfully"}), 200
    except Exception as e:
        db.rollback()
        print(e)
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/add_payment_loan", methods=['POST'])
def add_payment_loan():
    db = get_db_connection()
    data = request.get_json()
    sales_id = data.get('sales_id')
    loan_id = data.get('loan_id')

    if not sales_id or not loan_id:
        return jsonify({"error": "Sales ID and Loan ID are required"}), 400

    try:
        with db.cursor() as cursor:
            sql = """
                INSERT INTO payment_loan (loan_id, sales_id, insert_date, update_date)
                VALUES (%s, %s, NOW(), NOW());
            """
            cursor.execute(sql, (loan_id, sales_id))
            db.commit()
            return jsonify({"success": True, "message": "Payment loan record added successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/proxy_get_loan_details_by_sales', methods=['POST'])
def proxy_get_loan_details_by_sales():
    data = request.get_json()
    sales_id = data.get('sales_id')

    if not sales_id:
        return jsonify({"error": "Sales ID is required"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Retrieve the loan ID associated with the given sales ID
            cursor.execute("""
                SELECT loan_id FROM payment_loan
                WHERE sales_id = %s
            """, (sales_id,))
            loan_record = cursor.fetchone()
            
            if not loan_record:
                return jsonify({"error": "No loan associated with the provided sales ID"}), 404

            loan_id = loan_record['loan_id']

            # Fetch loan details from the other service
            loan_details_response = requests.post('http://localhost:5001/get_loan_details', json={"loan_id": loan_id})
            if not loan_details_response.ok:
                # Handle cases where the remote service fails or returns an error
                return jsonify({"error": "Failed to retrieve loan details", "message": loan_details_response.text}), loan_details_response.status_code
            
            return jsonify(loan_details_response.json()), loan_details_response.status_code
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()


@app.route("/createContract", methods=['POST'])
def createContract():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id1 = data.get('user_id1')

    try:
        with db.cursor() as cursor:
            query = """
                INSERT INTO contract (user_id1)
                VALUES (%s)
            """
            cursor.execute(query, (user_id1,))
            db.commit()
            return jsonify({"message": "Contract created successfully", "contract_id": cursor.lastrowid}), 201
    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/updateContract", methods=['POST'])
def updateContract():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    contract_id = data.get('contract_id')
    user_id2 = data.get('user_id2')

    if not contract_id or not user_id2:
        return jsonify({"error": "Missing contract_id or user_id2"}), 400

    try:
        with db.cursor() as cursor:
            query = """
                UPDATE contract
                SET user_id2 = %s, signed = 1
                WHERE contract_id = %s AND user_id2 IS NULL
            """
            cursor.execute(query, (user_id2, contract_id))
            db.commit()
            
            if cursor.rowcount == 0:
                return jsonify({"message": "No contract updated, check your contract_id and make sure user_id2 is not already set"}), 404
            
            return jsonify({"message": "Contract updated successfully"}), 200
    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
        
@app.route("/getUserCarSales", methods=['POST'])
@jwt_required()
def getUserCarSales():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    with db.cursor() as cursor:
        query = """
            SELECT sales_id, user_id, financeOrCash, insert_date, update_date, vin
            FROM car_sales
            WHERE user_id = %s
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        if not results:
            return jsonify({"message": "No car sales found for this user"}), 404

        car_sales_list = []
        for result in results:
            car_sales_data = {
                "sales_id": result[0],
                "user_id": result[1],
                "financeOrCash": result[2],
                "insert_date": result[3].strftime("%Y-%m-%d %H:%M:%S"),
                "update_date": result[4].strftime("%Y-%m-%d %H:%M:%S"),
                "vin": result[5]
            }
            car_sales_list.append(car_sales_data)

        return jsonify({"carSales": car_sales_list}), 200

@app.route("/getUnsignedContracts", methods=['POST'])
@jwt_required()
def getUnsignedContracts():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id', None)

    try:
        with db.cursor() as cursor:
            if user_id:
                query = """
                    SELECT c.contract_id, c.user_id1, u.first_name, u.last_name, 
                           RIGHT(u.ssn, 4) AS ssn_last_4, u.phone_number
                    FROM contract AS c
                    JOIN users AS u ON c.user_id1 = u.user_id
                    WHERE c.signed = 0 AND c.user_id1 = %s
                """
                cursor.execute(query, (user_id,))
            else:
                query = """
                    SELECT c.contract_id, c.user_id1, u.first_name, u.last_name, 
                           RIGHT(u.ssn, 4) AS ssn_last_4, u.phone_number
                    FROM contract AS c
                    JOIN users AS u ON c.user_id1 = u.user_id
                    WHERE c.signed = 0
                """
                cursor.execute(query)
            
            results = cursor.fetchall()
            
            contracts = [{
                "contract_id": row[0],
                "user_id1": row[1],
                "first_name": row[2],
                "last_name": row[3],
                "ssn_last_4": row[4],
                "phone_number": row[5]
            } for row in results]

            return jsonify({"contracts": contracts}), 200

    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/getUserDetails", methods=['POST'])
@jwt_required()
def getUserDetails():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')

    try:
        with db.cursor() as cursor:
            # Define SQL query to select relevant fields
            query = """
                SELECT users.user_id, first_name, last_name,username AS formatted_date
                FROM users left join authentication on users.user_id = authentication.user_id
                WHERE users.user_id = %s
            """
            cursor.execute(query, (user_id))
            result = cursor.fetchone()

            # Check if user data was found
            if result:
                user_data = {
                    "user_id": result[0],
                    "first_name": result[1].capitalize(),
                    "last_name": result[2].capitalize(),
                    "username": result[3].capitalize()  # formatted_date from SQL
                }
                return jsonify(user_data), 200
            else:
                return jsonify({"error": "User not found"}), 404

    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/checkServiceWarranty", methods=['POST'])
@jwt_required()
def checkServiceWarranty():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')
    service_option_id = data.get('service_option_id')

    if not vin or not service_option_id:
        return jsonify({"error": "Missing required parameters: VIN or Service Option ID"}), 400

    try:
        with db.cursor() as cursor:
            query = """
                SELECT 1 FROM carWarranty
                WHERE vin = %s AND option_id = %s
            """
            cursor.execute(query, (vin, service_option_id))
            exists = cursor.fetchone()

            if exists:
                return jsonify({"warranty_covered": True, "message": "This service is covered under warranty."}), 200
            else:
                return jsonify({"warranty_covered": False, "message": "This service is not covered under warranty."}), 200

    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/getServiceSales", methods=['POST'])
@jwt_required()  # Requires token to access
def getServiceSales():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        with db.cursor() as cursor:
            query = """
                SELECT ss.service_sale_id, ss.service_appointment_id, ss.user_id, ss.service_option_id,
                       ss.price, ss.card_last_four, ss.insert_date, ss.update_date, so.description
                FROM service_sales AS ss
                JOIN service_options AS so ON ss.service_option_id = so.option_id
                WHERE ss.user_id = %s
                ORDER BY ss.insert_date DESC
            """
            cursor.execute(query, (user_id,))
            results = cursor.fetchall()
            
            service_sales = [{
                "service_sale_id": row[0],
                "service_appointment_id": row[1],
                "user_id": row[2],
                "service_option_id": row[3],
                "price": float(row[4]),
                "card_last_four": row[5],
                "insert_date": row[6].strftime("%Y-%m-%d %H:%M:%S"),
                "update_date": row[7].strftime("%Y-%m-%d %H:%M:%S"),
                "service_description": row[8]
            } for row in results]

            return jsonify({"serviceSales": service_sales}), 200

    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/markAsSold", methods=['POST'])
@jwt_required()  # Ensure this endpoint is protected by authentication
def markAsSold():
    db = pymysql.connect(host=HOST, user=USER, password=PASSWORD, db=DB)
    data = request.get_json()
    vin = data.get('vin')

    if not vin:
        return jsonify({"error": "VIN is required"}), 400

    try:
        with db.cursor() as cursor:
            # Update the status in the inventory table
            query = """
                    UPDATE inventory 
                    SET status = 'Sold'
                    WHERE vin = %s AND status = 'InStock'
                    """
            cursor.execute(query, (vin,))
            db.commit()

            if cursor.rowcount == 0:
                # If no rows are updated, it could be that the VIN was not found or it was already sold
                return jsonify({"message": "No car updated, car may already be sold or VIN is incorrect"}), 404

            return jsonify({"message": "Car marked as sold successfully"}), 200

    except pymysql.MySQLError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()


if __name__ == "__main__":
    app.run(debug=True)

