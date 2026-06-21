import { useState } from "react";
import api from "../api/axios";
import AdminLayout from "./AdminLayout";
import { PlusCircle, Upload, Image, ArrowRight, DollarSign } from "lucide-react";

export default function AddCar() {
  const [form, setForm] = useState({
    carName: "",
    brand: "",
    pricePerDay: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    seats: 5
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.carName || !form.brand || !form.pricePerDay || !image) {
      setError("Please complete all required fields and upload an image.");
      return;
    }

    setSubmitting(true);
    setError("");

    const data = new FormData();
    Object.keys(form).forEach(key => {
      data.append(key, form[key]);
    });
    data.append("image", image);

    try {
      await api.post("/cars", data);
      alert("Vehicle registered in database successfully!");
      setForm({
        carName: "",
        brand: "",
        pricePerDay: "",
        fuelType: "Petrol",
        transmission: "Automatic",
        seats: 5
      });
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Add Fleet Vehicle</h1>
          <p className="text-slate-400 text-sm font-medium">Register a new vehicle with specs and pricing ranges.</p>
        </div>

        {/* Card containing form */}
        <div className="glass p-8 rounded-3xl border border-slate-800/80 max-w-4xl">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Input Text Fields */}
            <div className="space-y-4">
              
              {/* Car Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Car Name (Model)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortuner Sigma 4"
                  value={form.carName}
                  onChange={(e) => setForm({ ...form, carName: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                  disabled={submitting}
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Manufacturer Brand</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                  disabled={submitting}
                />
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Fuel */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fuel</label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-3 text-slate-200 text-xs outline-none transition-all cursor-pointer"
                  >
                    <option value="Petrol" className="bg-slate-900">Petrol</option>
                    <option value="Diesel" className="bg-slate-900">Diesel</option>
                    <option value="Electric" className="bg-slate-900">Electric</option>
                    <option value="Hybrid" className="bg-slate-900">Hybrid</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gearbox</label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-3 text-slate-200 text-xs outline-none transition-all cursor-pointer"
                  >
                    <option value="Automatic" className="bg-slate-900">Auto</option>
                    <option value="Manual" className="bg-slate-900">Manual</option>
                  </select>
                </div>

                {/* Seats */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Seats</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: +e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 px-3 text-slate-200 text-xs outline-none transition-all text-center"
                    disabled={submitting}
                  />
                </div>

              </div>

              {/* Price / Day */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price Per Day (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2500"
                    value={form.pricePerDay}
                    onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 rounded-2xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
                    disabled={submitting}
                  />
                </div>
              </div>

            </div>

            {/* Right: File Upload / Preview Panel */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Image Asset</label>
                
                {imagePreview ? (
                  <div className="relative border border-slate-800 rounded-3xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-lg text-xs"
                      disabled={submitting}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-800 rounded-3xl aspect-video flex flex-col items-center justify-center p-6 text-center hover:border-slate-700 transition-colors bg-slate-900/10">
                    <Image size={32} className="text-slate-600 mb-2" />
                    <span className="text-xs text-slate-400 font-semibold mb-1">Upload dynamic vehicle photo</span>
                    <span className="text-[10px] text-slate-600 mb-4">PNG, JPG, or WEBP up to 5MB</span>
                    
                    <label className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all">
                      <Upload size={14} className="inline mr-1" />
                      <span>Select Asset File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={submitting}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer mt-4"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span>Register Fleet Vehicle</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </AdminLayout>
  );
}