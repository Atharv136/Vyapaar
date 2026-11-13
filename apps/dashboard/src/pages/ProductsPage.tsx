import React, { useState } from 'react';
import { Search, Plus, Upload, AlertCircle, CheckCircle2, Edit3, X, Filter, FileSpreadsheet } from 'lucide-react';
import { Product } from '../types';

interface ProductsPageProps {
  products: Product[];
  onUpdateProduct: (updated: Product) => void;
  onAddProduct: (newProduct: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onUpdateProduct,
  onAddProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // CSV Import State (C-01, C-02, C-03)
  const [csvContent, setCsvContent] = useState<string>(
`SKU,Name,Category,PriceRupees,Stock
GHEE-AMUL-1L,Amul Pure Ghee 1L,Dairy,620.00,25
HONEY-DABUR-500G,Dabur Honey 500g,Pantry,195.50,18
BAD-ITEM-01,Invalid Price Item,Pantry,-50.00,10
BAD-ITEM-02,,Pantry,120.00,15`
  );
  const [csvReport, setCsvReport] = useState<{ imported: number; rejected: { row: number; reason: string }[] } | null>(null);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const formatRupees = (paise: number) => {
    return '₹' + (paise / 100).toFixed(2);
  };

  const filteredProducts = products.filter(p => {
    const available = p.onHand - p.reserved;
    const isLowStock = available <= p.lowStockThreshold;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesLowStock = !lowStockOnly || isLowStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setToastMessage(`Updated ${editingProduct.name} stock and price.`);
    setEditingProduct(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunCsvImport = () => {
    const lines = csvContent.trim().split('\n');
    let importedCount = 0;
    const rejected: { row: number; reason: string }[] = [];

    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 5) {
        rejected.push({ row: idx + 2, reason: 'Insufficient columns' });
        return;
      }
      const [sku, name, category, priceStr, stockStr] = parts;
      const price = parseFloat(priceStr);
      const stock = parseInt(stockStr, 10);

      if (!sku || !name) {
        rejected.push({ row: idx + 2, reason: 'Missing SKU or Name' });
        return;
      }
      if (isNaN(price) || price <= 0) {
        rejected.push({ row: idx + 2, reason: 'Price must be positive integer/float (C-02)' });
        return;
      }
      if (isNaN(stock) || stock < 0) {
        rejected.push({ row: idx + 2, reason: 'Stock must be non-negative' });
        return;
      }

      // Convert rupees string to integer paise (C-03)
      const pricePaise = Math.round(price * 100);
      const newProd: Product = {
        id: 'p-' + Date.now() + '-' + idx,
        sku,
        name,
        category,
        description: 'Imported via CSV',
        pricePaise,
        unit: 'standard',
        onHand: stock,
        reserved: 0,
        lowStockThreshold: 5,
        inStock: stock > 0
      };
      onAddProduct(newProd);
      importedCount++;
    });

    setCsvReport({ imported: importedCount, rejected });
    setToastMessage(`CSV Import Complete: ${importedCount} items imported, ${rejected.length} rows rejected.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <h1 className="font-bold text-2xl text-ink-primary">Catalog &amp; Live Inventory</h1>
          <p className="text-xs text-ink-secondary">
            Live catalog synchronized with WhatsApp tools. Prices stored in whole integer paise (Rule 6).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="btn-sketch bg-white px-3.5 py-2 rounded-xl text-xs font-bold text-forest flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Bulk Sync</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-forest px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-mint border border-emerald text-emerald-dark rounded-xl text-xs font-bold flex justify-between items-center">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search and Filters Strip */}
      <div className="bg-white p-3 rounded-2xl border border-border-light flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, SKU, brand..."
              className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-border-light rounded-xl text-xs focus:outline-forest"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-canvas border border-border-light rounded-xl px-3 py-1.5 text-xs text-ink-secondary focus:outline-forest capitalize"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-ink-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded text-forest focus:ring-forest"
          />
          <span className="flex items-center gap-1 text-coral-dark">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Low Stock / Out of Stock Only</span>
          </span>
        </label>
      </div>

      {/* Products Table (Step 9.5 & C-01 to C-05) */}
      <div className="card-sketch bg-white overflow-hidden shadow-sketchLg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border-light font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="p-3.5">Product &amp; SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price (₹ / Paise)</th>
                <th className="p-3.5 text-center">On Hand</th>
                <th className="p-3.5 text-center">Reserved</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredProducts.map(p => {
                const available = p.onHand - p.reserved; // I-02: available = on_hand - reserved
                const isLow = available <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-tinted/50 transition-colors">
                    <td className="p-3.5">
                      <strong className="block text-ink-primary">{p.name}</strong>
                      <span className="font-mono text-[10px] text-ink-muted">{p.sku} · {p.unit}</span>
                    </td>
                    <td className="p-3.5 text-ink-secondary">{p.category}</td>
                    <td className="p-3.5">
                      <strong className="font-mono text-sm text-forest block">{formatRupees(p.pricePaise)}</strong>
                      <span className="font-mono text-[10px] text-ink-muted">{p.pricePaise} paise</span>
                    </td>
                    <td className="p-3.5 text-center font-mono">{p.onHand}</td>
                    <td className="p-3.5 text-center font-mono text-amber-dark font-semibold">
                      {p.reserved > 0 ? `${p.reserved} locked` : '0'}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-sm">
                      <span className={available === 0 ? 'text-coral-dark' : isLow ? 'text-amber-dark' : 'text-emerald-dark'}>
                        {available}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {available === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-coral-soft text-coral-dark text-[10px] font-bold">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-soft text-amber-dark text-[10px] font-bold">
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-mint text-emerald-dark text-[10px] font-bold">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="btn-sketch bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-forest hover:bg-tinted flex items-center gap-1 ml-auto"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal (D-04: Edit Price & Stock) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-forest">
            <div className="flex justify-between items-center pb-3 border-b border-border-light mb-4">
              <h3 className="font-bold text-base text-ink-primary">Edit SKU: {editingProduct.sku}</h3>
              <button onClick={() => setEditingProduct(null)}><X className="w-5 h-5 text-ink-muted" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs text-ink-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1">Price (₹ Rupees)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={(editingProduct.pricePaise / 100).toFixed(2)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePaise: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-ink-muted font-mono">{editingProduct.pricePaise} paise</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1">On Hand Units</label>
                  <input
                    type="number"
                    value={editingProduct.onHand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, onHand: parseInt(e.target.value || '0', 10) })}
                    className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-amber-dark font-mono">Reserved: {editingProduct.reserved}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1">Low Stock Warning Threshold</label>
                <input
                  type="number"
                  value={editingProduct.lowStockThreshold}
                  onChange={(e) => setEditingProduct({ ...editingProduct, lowStockThreshold: parseInt(e.target.value || '0', 10) })}
                  className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-border-light flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-forest px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save &amp; Sync to WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Sync Modal (C-01, C-02, C-03) */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-forest">
            <div className="flex justify-between items-center pb-3 border-b border-border-light mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-forest" />
                <h3 className="font-bold text-base text-ink-primary">CSV Catalog Sync &amp; Validation</h3>
              </div>
              <button onClick={() => setShowCsvModal(false)}><X className="w-5 h-5 text-ink-muted" /></button>
            </div>

            <p className="text-xs text-ink-secondary mb-3">
              Converts decimal rupees into integer paise automatically (C-03) and audits invalid rows before inserting (C-01, C-02).
            </p>

            <textarea
              rows={7}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full font-mono text-xs p-3 bg-canvas border border-border-light rounded-xl focus:outline-forest mb-3"
            />

            {csvReport && (
              <div className="p-3 bg-tinted rounded-xl border border-border-light mb-3 text-xs">
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-emerald-dark">✅ Successfully Imported: {csvReport.imported}</span>
                  <span className="text-coral-dark">❌ Rejected: {csvReport.rejected.length}</span>
                </div>
                {csvReport.rejected.map((r, i) => (
                  <div key={i} className="text-[11px] text-coral-dark">
                    • Row {r.row}: {r.reason}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-ink-muted"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRunCsvImport}
                className="btn-forest px-5 py-2 rounded-xl text-xs font-bold"
              >
                Parse &amp; Import Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

