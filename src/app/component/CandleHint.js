import React, { useState } from 'react';

const CandleHint = ({ lit }) => {
  const [hidden, setHidden] = useState(false);

  // ถ้าจุดเทียนแล้ว หรือผู้ใช้ปิดเอง => ไม่แสดงข้อความ
  if (lit || hidden) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.hintBox}>
        <button onClick={() => setHidden(true)} style={styles.closeBtn}>✖</button>
        <div>🎂</div>
        <div>คลิกที่เค้ก จุดเทียน ก่อนนะ !</div> 
        <div>เป่าเค้กด้วยน้าาา</div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  hintBox: {
    position: 'relative',
    background: '#fff',
    color: '#333',
    padding: '20px 30px',
    borderRadius: '12px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    textAlign: 'center'
  },
  closeBtn: {
    position: 'absolute',
    top: '8px',
    right: '12px',
    background: 'transparent',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#999'
  }
};

export default CandleHint;
