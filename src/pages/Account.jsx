import React, { useState } from 'react';

const Account = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container section-padding" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-cream)', padding: '3rem 2rem', border: '1px solid var(--color-gray-light)' }}>
        <h1 className="title-medium text-center" style={{ marginBottom: '2rem', fontSize: '2rem' }}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <>
              <input type="text" placeholder="Nombre" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
              <input type="text" placeholder="Apellido" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
            </>
          )}
          <input type="email" placeholder="Correo electrónico" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
          <input type="password" placeholder="Contraseña" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
          
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'INGRESAR' : 'REGISTRARSE'}
          </button>
        </form>
        
        <div className="text-center" style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--color-gray)', textDecoration: 'underline', fontSize: '0.9rem' }}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
