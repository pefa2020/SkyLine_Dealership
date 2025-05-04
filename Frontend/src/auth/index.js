// import {createAuthProvider} from 'react-token-auth';

// // export const login = ({ access_token, user_id }) => {
// //     // Store the token and user ID in localStorage
// //     localStorage.setItem('access_token', access_token);
// //     localStorage.setItem('user_id', user_id);
  
// //     // Optionally, store additional information as needed
// //     // localStorage.setItem('job_title', job_title);
// //   };
  
// //   export const logout = () => {
// //     // Remove the stored items on logout
// //     localStorage.removeItem('access_token');
// //     localStorage.removeItem('user_id');
// //     // localStorage.removeItem('job_title');
  
// //     // Redirect to login page or perform other cleanup actions
// //     // navigate('/login'); // You might need to pass `navigate` or use it within a component
// //   };
  
// //   export const isAuthenticated = () => {
// //     // Check if the access token exists and is valid (basic check)
// //     const token = localStorage.getItem('access_token');
// //     return !!token; // Returns true if token exists, false otherwise
// //   };
  
// //   export const getToken = () => {
// //     // Retrieve the access token from storage
// //     return localStorage.getItem('access_token');
// //   };
  
// //   export const getUserId = () => {
// //     // Retrieve the user ID from storage
// //     return localStorage.getItem('user_id');
// //   };
  

// export const [useAuth, authFetch, login, logout] =
//     createAuthProvider({
//         accessTokenKey: 'access_token',
//         onUpdateToken: (token) => fetch('/api/refresh', {
//             method: 'POST',
//             body: token.access_token
//         })
//         .then(r => r.json())
//     });