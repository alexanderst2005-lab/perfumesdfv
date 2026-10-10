import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, FileText, Settings, DollarSign, TrendingUp, Calendar, BarChart2, LogOut, ChevronRight } from 'lucide-react';
import InventoryModule from '../components/admin/InventoryModule';
import OrdersModule from '../components/admin/OrdersModule';
import SettingsModule from '../components/admin/SettingsModule';
import CampaignsModule from '../components/admin/CampaignsModule';
import CustomersModule from '../components/admin/CustomersModule';
import SalesModule from '../components/admin/SalesModule';
import CategoriesModule from '../components/admin/CategoriesModule';
import ContentModule from '../components/admin/ContentModule';

const AdminDashboard = () => {
  const { products, isLoadingProducts } = useShop();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
        }
      });
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'sales', label: 'Ventas', icon: BarChart2 },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  // Calculate stats
  const totalRevenue = orders.filter(o => o.status !== 'CANCELADO').reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.filter(o => o.status !== 'CANCELADO').length;
  
  const statusEnCamino = orders.filter(o => o.status === 'ENVIADO').length;
  const statusPendiente = orders.filter(o => o.status === 'NUEVO' || o.status === 'EN PREPARACIÓN').length;
  const statusCancelado = orders.filter(o => o.status === 'CANCELADO').length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status !== 'CANCELADO';
  });
  const thisMonthRevenue = thisMonthOrders.reduce((acc, o) => acc + o.total, 0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', position: 'relative' }}>
      <style>{`
        .admin-sidebar {
          width: 250px;
          background-color: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          z-index: 50;
        }
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          overflow-x: hidden;
        }
        .admin-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #111827;
        }
        .admin-overlay {
          display: none;
        }
        .admin-content {
          padding: 3rem;
          overflow-x: auto;
        }
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-hamburger {
            display: block;
          }
          .admin-overlay.open {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 40;
          }
          .admin-content {
            padding: 1rem;
          }
          .admin-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-content table {
            min-width: 800px !important;
          }
          .admin-content th, .admin-content td {
            white-space: nowrap;
          }
          div[style*="overflow: hidden"] {
            overflow-x: auto !important;
          }
          /* Custom scrollbar for mobile tables */
          div[style*="overflow: hidden"]::-webkit-scrollbar {
            height: 6px;
          }
          div[style*="overflow: hidden"]::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 4px;
          }
        }
      `}</style>

      {/* OVERLAY */}
      <div className={`admin-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '2.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--color-black)', fontFamily: 'var(--font-serif)', fontWeight: '400', fontSize: '2.2rem', letterSpacing: '-0.5px', lineHeight: '0.9', textAlign: 'center', width: '100%' }}>
            DFV<br/><span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', display: 'block', textAlign: 'center', fontWeight: '300', marginTop: '4px' }}>PERFUMES</span>
          </div>
          <button className="admin-hamburger" onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <LogOut size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
                  padding: '1rem 2rem', border: 'none',
                  backgroundColor: isActive ? '#f9fafb' : 'transparent',
                  color: isActive ? '#111827' : '#6b7280',
                  fontSize: '0.9rem', fontWeight: isActive ? '600' : '500', cursor: 'pointer',
                  borderLeft: isActive ? '4px solid #111827' : '4px solid transparent',
                  transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e5e7eb' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', justifyContent: 'center' }}>
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        
        {/* HEADER */}
        <header style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="admin-hamburger" onClick={() => setIsSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>Administrador</div>
        </header>

        <main className="admin-content" onClick={() => { if(isSidebarOpen) setIsSidebarOpen(false) }}>
          {activeTab === 'dashboard' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              
              {/* TOP CARDS ROW 1 */}
              <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>INGRESOS DEL MES</p>
                    <DollarSign size={16} color="#9ca3af" />
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>${thisMonthRevenue.toLocaleString()}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Pedidos confirmados</p>
                </div>
                
                <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>ESTA SEMANA</p>
                    <TrendingUp size={16} color="#9ca3af" />
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>${thisMonthRevenue.toLocaleString()}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#10b981', margin: 0 }}>+0% vs semana anterior</p>
                </div>
              </div>

              {/* TOP CARDS ROW 2 */}
              <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL PEDIDOS</p>
                    <Calendar size={16} color="#9ca3af" />
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>{totalOrders}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{totalOrders} confirmados</p>
                </div>
                
                <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>INGRESOS TOTALES</p>
                    <BarChart2 size={16} color="#9ca3af" />
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>${totalRevenue.toLocaleString()}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Histórico</p>
                </div>
              </div>

              {/* TOP PRODUCTOS VENDIDOS */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '1.5rem' }}>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>TOP PRODUCTOS VENDIDOS</p>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No hay datos aún.</p>
              </div>

              {/* PEDIDOS POR ESTADO */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '1.5rem' }}>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>PEDIDOS POR ESTADO</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, backgroundColor: '#e0f2fe', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0284c7' }}>{statusEnCamino}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px' }}>EN CAMINO</span>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fef9c3', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ca8a04' }}>{statusPendiente}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '1px' }}>PENDIENTE</span>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fee2e2', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626' }}>{statusCancelado}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>CANCELADO</span>
                  </div>
                </div>
              </div>

              {/* ULTIMOS PEDIDOS */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingCart size={18} color="#4b5563" />
                  <p style={{ color: '#111827', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>ÚLTIMOS PEDIDOS</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.8rem', fontWeight: '500' }}>
                  VER TODOS <ChevronRight size={14} />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'inventory' && <InventoryModule />}
          {activeTab === 'orders' && <OrdersModule />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'categories' && <CategoriesModule />}
          {activeTab === 'customers' && <CustomersModule />}
          {activeTab === 'settings' && <SettingsModule />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
