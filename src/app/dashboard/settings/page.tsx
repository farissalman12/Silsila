import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Silsila account settings.",
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]} className="mb-6" />

      <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800 mb-6">
        <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Display Name</label>
            <input type="text" defaultValue="Contributor User" className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
            <input type="email" defaultValue="contributor@silsila.pk" disabled className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-sm cursor-not-allowed" />
          </div>
          <button className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800 mb-6">
        <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Privacy</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400" />
            <span className="text-sm text-stone-700 dark:text-stone-300">Show my contributions publicly</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400" />
            <span className="text-sm text-stone-700 dark:text-stone-300">Email me when my contributions are reviewed</span>
          </label>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 bg-red-50 dark:bg-red-900/10 rounded-card border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-serif font-bold text-red-800 dark:text-red-300 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Deleting your account will remove all your contributions and cannot be undone.
        </p>
        <button className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          Delete Account
        </button>
      </section>
    </div>
  );
}
