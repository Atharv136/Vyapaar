import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { ShowcasePage } from './pages/ShowcasePage';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { LeadsPage } from './pages/LeadsPage';
import { SettingsPage } from './pages/SettingsPage';

import {
  mockTenants,
  mockProducts,
  mockCustomers,
  mockConversations,
  mockOrders
} from './data/mockData';
import { Tenant, Order, Conversation, Product, Customer } from './types';

export const App: React.FC = () => {
  // Navigation state
  const [currentView, setCurrentView] = useState<string>('showcase');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for demo; can logout to test D-01

  // Application state (Single source of truth)
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [activeTenant, setActiveTenant] = useState<Tenant>(mockTenants[0]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Auth gate per Step 9.1 & D-01: unauthenticated users redirected to Login
  const handleNavigate = (view: string) => {
    if (view.startsWith('dashboard') && !isAuthenticated) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (tenant: Tenant) => {
    setIsAuthenticated(true);
    setActiveTenant(tenant);
    setCurrentView('dashboard-overview');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  // State update handlers
  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateOrder = (updated: Order) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleUpdateTenant = (updated: Tenant) => {
    setActiveTenant(updated);
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans selection:bg-emerald-light selection:text-forest">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        activeTenant={activeTenant}
        tenants={tenants}
        onSelectTenant={setActiveTenant}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onLoginClick={() => setCurrentView('login')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'showcase' && (
          <ShowcasePage onOpenDashboard={() => handleNavigate('dashboard-overview')} />
        )}

        {currentView === 'login' && (
          <LoginPage
            tenants={tenants}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentView('showcase')}
          />
        )}

        {currentView === 'dashboard-overview' && (
          <OverviewPage
            tenant={activeTenant}
            orders={orders}
            conversations={conversations}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard-conversations' && (
          <ConversationsPage
            conversations={conversations}
            onUpdateConversation={handleUpdateConversation}
          />
        )}

        {currentView === 'dashboard-orders' && (
          <OrdersPage
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
          />
        )}

        {currentView === 'dashboard-products' && (
          <ProductsPage
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
          />
        )}

        {currentView === 'dashboard-customers' && (
          <CustomersPage
            customers={customers}
            onUpdateCustomer={handleUpdateCustomer}
          />
        )}

        {currentView === 'dashboard-leads' && (
          <LeadsPage />
        )}

        {currentView === 'dashboard-settings' && (
          <SettingsPage
            tenant={activeTenant}
            onUpdateTenant={handleUpdateTenant}
          />
        )}
      </main>
    </div>
  );
};

