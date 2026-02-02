"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  miningMachinesApi,
  MiningMachine,
  CreateMiningMachineData,
  UpdateMiningMachineData,
  ApiError,
} from "@/app/lib/api";

type FormData = CreateMiningMachineData;

const initialFormData: FormData = {
  name: "",
  description: "",
  image: "",
  type: "asic",
  manufacturer: "",
  model: "",
  hashRate: 0,
  hashRateUnit: "TH/s",
  powerConsumption: 0,
  algorithm: "SHA-256",
  miningCoin: "BTC",
  efficiency: 0,
  pricePerHour: 0,
  pricePerDay: 0,
  pricePerWeek: 0,
  pricePerMonth: 0,
  profitPerHour: 0,
  profitPerDay: 0,
  profitPerWeek: 0,
  profitPerMonth: 0,
  status: "available",
  totalUnits: 1,
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

export default function MachinesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action");
  const editId = searchParams.get("edit");

  const [machines, setMachines] = useState<MiningMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingMachine, setEditingMachine] = useState<MiningMachine | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchMachines = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await miningMachinesApi.getAll();
      setMachines(response.data || []);
    } catch (err) {
      console.error("Failed to fetch machines:", err);
      setError("Failed to load machines");
      setMachines([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  useEffect(() => {
    if (action === "new") {
      setEditingMachine(null);
      setFormData(initialFormData);
      setShowModal(true);
    } else if (editId && machines) {
      const machine = machines.find((m) => m.id === editId);
      if (machine) {
        setEditingMachine(machine);
        setFormData({
          name: machine.name,
          description: machine.description || "",
          image: machine.image || "",
          type: machine.type,
          manufacturer: machine.manufacturer || "",
          model: machine.model || "",
          hashRate: machine.hashRate || 0,
          hashRateUnit: machine.hashRateUnit || "TH/s",
          powerConsumption: machine.powerConsumption || 0,
          algorithm: machine.algorithm || "",
          miningCoin: machine.miningCoin || "",
          efficiency: machine.efficiency || 0,
          pricePerHour: machine.pricePerHour,
          pricePerDay: machine.pricePerDay,
          pricePerWeek: machine.pricePerWeek,
          pricePerMonth: machine.pricePerMonth,
          profitPerHour: machine.profitPerHour,
          profitPerDay: machine.profitPerDay,
          profitPerWeek: machine.profitPerWeek,
          profitPerMonth: machine.profitPerMonth,
          status: machine.status,
          totalUnits: machine.totalUnits,
          isActive: machine.isActive,
          isFeatured: machine.isFeatured,
          sortOrder: machine.sortOrder,
        });
        setShowModal(true);
      }
    }
  }, [action, editId, machines]);

  const closeModal = () => {
    setShowModal(false);
    setEditingMachine(null);
    setFormData(initialFormData);
    setError(null);
    router.push("/admin/machines");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (editingMachine) {
        await miningMachinesApi.update(editingMachine.id, formData as UpdateMiningMachineData);
        setSuccess("Machine updated successfully");
      } else {
        await miningMachinesApi.create(formData);
        setSuccess("Machine created successfully");
      }
      
      await fetchMachines();
      closeModal();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await miningMachinesApi.delete(id);
      setSuccess("Machine deleted successfully");
      await fetchMachines();
      setDeleteConfirmId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete machine");
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await miningMachinesApi.toggleActive(id);
      await fetchMachines();
    } catch (err) {
      console.error("Failed to toggle active:", err);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await miningMachinesApi.toggleFeatured(id);
      await fetchMachines();
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Mining <span className="gradient-text">Machines</span>
          </h1>
          <p className="text-foreground-muted text-sm">
            Create and manage mining machines available for rent.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/machines?action=new")}
          className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Machine
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green/10 border border-green/30 text-green flex items-center gap-3 animate-fade-in-up">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      
      {error && !showModal && (
        <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 text-red flex items-center gap-3 animate-fade-in-up">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Machines Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Machine</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Specs</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Pricing</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Profit/Day</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-12 bg-background-secondary/50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : (machines?.length || 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-secondary flex items-center justify-center">
                      <svg className="w-8 h-8 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <p className="text-foreground-muted">No machines found</p>
                    <button
                      onClick={() => router.push("/admin/machines?action=new")}
                      className="mt-2 text-gold hover:underline text-sm"
                    >
                      Add your first machine
                    </button>
                  </td>
                </tr>
              ) : (
                (machines || []).map((machine) => (
                  <tr key={machine.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{machine.name}</p>
                          <p className="text-xs text-foreground-muted">{machine.manufacturer} {machine.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{machine.hashRate} {machine.hashRateUnit}</p>
                      <p className="text-xs text-foreground-muted">{machine.powerConsumption}W • {machine.algorithm}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">${machine.pricePerDay}/day</p>
                      <p className="text-xs text-foreground-muted">${machine.pricePerMonth}/month</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-green font-medium">${machine.profitPerDay}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleActive(machine.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            machine.isActive
                              ? "bg-green/10 text-green"
                              : "bg-foreground-muted/10 text-foreground-muted"
                          }`}
                        >
                          {machine.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(machine.id)}
                          className={`p-1 rounded transition-colors ${
                            machine.isFeatured ? "text-gold" : "text-foreground-muted hover:text-gold"
                          }`}
                          title={machine.isFeatured ? "Remove from featured" : "Add to featured"}
                        >
                          <svg className="w-4 h-4" fill={machine.isFeatured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/machines?edit=${machine.id}`)}
                          className="p-2 rounded-lg hover:bg-gold/10 text-foreground-muted hover:text-gold transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(machine.id)}
                          className="p-2 rounded-lg hover:bg-red/10 text-foreground-muted hover:text-red transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingMachine ? "Edit Machine" : "Add New Machine"}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gold/10 text-foreground-muted hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 text-red text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="Antminer S19 Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="asic">ASIC</option>
                      <option value="gpu">GPU</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Manufacturer</label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="Bitmain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="S19 Pro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-foreground-muted mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm resize-none"
                      placeholder="High-performance Bitcoin mining machine..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-foreground-muted mb-2">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-sm font-semibold text-gold mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Hash Rate</label>
                    <input
                      type="number"
                      name="hashRate"
                      value={formData.hashRate}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="110"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Hash Rate Unit</label>
                    <select
                      name="hashRateUnit"
                      value={formData.hashRateUnit}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="TH/s">TH/s</option>
                      <option value="GH/s">GH/s</option>
                      <option value="MH/s">MH/s</option>
                      <option value="KH/s">KH/s</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Power (Watts)</label>
                    <input
                      type="number"
                      name="powerConsumption"
                      value={formData.powerConsumption}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="3250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Algorithm</label>
                    <input
                      type="text"
                      name="algorithm"
                      value={formData.algorithm}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="SHA-256"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Mining Coin</label>
                    <input
                      type="text"
                      name="miningCoin"
                      value={formData.miningCoin}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="BTC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Efficiency (J/TH)</label>
                    <input
                      type="number"
                      name="efficiency"
                      value={formData.efficiency}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                      placeholder="29.5"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-sm font-semibold text-gold mb-4">Rental Pricing (USD)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Hour *</label>
                    <input
                      type="number"
                      name="pricePerHour"
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Day *</label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Week *</label>
                    <input
                      type="number"
                      name="pricePerWeek"
                      value={formData.pricePerWeek}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Month *</label>
                    <input
                      type="number"
                      name="pricePerMonth"
                      value={formData.pricePerMonth}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Profit */}
              <div>
                <h3 className="text-sm font-semibold text-gold mb-4">Expected Profit (USD)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Hour *</label>
                    <input
                      type="number"
                      name="profitPerHour"
                      value={formData.profitPerHour}
                      onChange={handleInputChange}
                      required
                      step="0.0001"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Day *</label>
                    <input
                      type="number"
                      name="profitPerDay"
                      value={formData.profitPerDay}
                      onChange={handleInputChange}
                      required
                      step="0.0001"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Week *</label>
                    <input
                      type="number"
                      name="profitPerWeek"
                      value={formData.profitPerWeek}
                      onChange={handleInputChange}
                      required
                      step="0.0001"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Per Month *</label>
                    <input
                      type="number"
                      name="profitPerMonth"
                      value={formData.profitPerMonth}
                      onChange={handleInputChange}
                      required
                      step="0.0001"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gold mb-4">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Total Units</label>
                    <input
                      type="number"
                      name="totalUnits"
                      value={formData.totalUnits}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-muted mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full input-gold px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-gold/30 bg-background-secondary text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-gold/30 bg-background-secondary text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-foreground">Featured</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {editingMachine ? "Update Machine" : "Create Machine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Machine</h3>
              <p className="text-foreground-muted text-sm mb-6">
                Are you sure you want to delete this machine? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-red text-white hover:bg-red/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

