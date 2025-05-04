import React from 'react';

function CompareButton({ onCompare }) {
    return (
        <button onClick={onCompare} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Compare
        </button>
    );
}

export default CompareButton;
