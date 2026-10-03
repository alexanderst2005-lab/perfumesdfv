import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, Image as ImageIcon, Settings, Store, HelpCircle, LayoutTemplate } from 'lucide-react';
import InventoryModule from '../components/admin/InventoryModule';
import OrdersModule from '../components/admin/OrdersModule';
import SettingsModule from '../components/admin/SettingsModule';

const AdminDashboard = () => {
  const { products, isLoadingProducts } = useShop();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'campaigns', label: 'Campañas', icon: LayoutTemplate },
    { id: 'media', label: 'Biblioteca', icon: ImageIcon },
    { id: 'stores', label: 'Tiendas', icon: Store },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #374151' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', letterSpacing: '1px' }}>DFV ADMIN</h2>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Panel de Control CMS</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                  padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
                  backgroundColor: isActive ? '#374151' : 'transparent',
                  color: isActive ? 'white' : '#9ca3af',
                  fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#1f2937'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', backgroundColor: '#f3f4f6' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2rem', color: '#111827' }}>Resumen de Actividad</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>TOTAL PRODUCTOS</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '600' }}>{isLoadingProducts ? '...' : products.length}</h3>
              </div>
              
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>PEDIDOS NUEVOS</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '600' }}>0</h3>
              </div>

              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>VENTAS DEL MES</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '600' }}>$0</h3>
              </div>

            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Pedidos Recientes</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <ShoppingCart size={40} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#6b7280' }}>No hay pedidos recientes.</p>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'orders' && <OrdersModule />}
        {activeTab === 'settings' && <SettingsModule />}

        {activeTab !== 'dashboard' && activeTab !== 'inventory' && activeTab !== 'orders' && activeTab !== 'settings' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '4rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>Módulo en Construcción (Fase 3)</h2>
            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
              Este módulo será habilitado en las próximas actualizaciones.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
