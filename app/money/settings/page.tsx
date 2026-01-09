"use client";

import { useState } from "react";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import CustomDropdown from "../../components/CustomDropdown";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" }
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: "preferences", label: "Preferences", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    )},
    { id: "notifications", label: "Notifications", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z" />
      </svg>
    )},
    { id: "security", label: "Security", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )}
  ];

  const ProfileSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" defaultValue="John" />
          <Input label="Last Name" defaultValue="Doe" />
          <Input label="Email" type="email" defaultValue="john.doe@example.com" />
          <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
        </div>
        <div className="mt-6">
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income</label>
            <Input defaultValue="$4,200" />
          </div>
          <div>
            <CustomDropdown
              options={currencyOptions}
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              label="Currency"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button variant="primary">Update Profile</Button>
        </div>
      </Card>
    </div>
  );

  const PreferencesSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Dark Mode</h4>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Compact View</h4>
              <p className="text-sm text-gray-600">Show more data in less space</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Data Export</h4>
              <p className="text-sm text-gray-600">Download your financial data</p>
            </div>
            <Button variant="secondary" size="sm">Export Data</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and data</p>
            </div>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const NotificationsSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { title: "Budget Alerts", description: "When you exceed budget limits", defaultChecked: true },
            { title: "Goal Milestones", description: "When you reach savings milestones", defaultChecked: true },
            { title: "Weekly Summary", description: "Weekly spending summary", defaultChecked: false },
            { title: "Monthly Reports", description: "Monthly financial reports", defaultChecked: true },
            { title: "Bill Reminders", description: "Upcoming bill payment reminders", defaultChecked: true }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {[
            { title: "Transaction Alerts", description: "Immediate alerts for new transactions", defaultChecked: true },
            { title: "Security Alerts", description: "Login and security notifications", defaultChecked: true },
            { title: "Goal Updates", description: "Progress updates on your goals", defaultChecked: false }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h3>
        <div className="space-y-4">
          <div>
            <Button variant="secondary" fullWidth className="justify-start">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6a2 2 0 01-2 2m-2-2H9m10 0a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h2m2 5.09V9a2 2 0 012-2h2a2 2 0 012 2v6.09M15 15l2 2l4-4" />
              </svg>
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button variant="primary" size="sm">Enable 2FA</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <div className="space-y-4">
          {[
            { device: "MacBook Pro", location: "New York, NY", lastActive: "Current session", current: true },
            { device: "iPhone 13", location: "New York, NY", lastActive: "2 hours ago", current: false },
            { device: "Chrome Browser", location: "New York, NY", lastActive: "1 day ago", current: false }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session.device}</p>
                  <p className="text-sm text-gray-600">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  Revoke
                </Button>
              )}
              {session.current && (
                <span className="text-sm text-green-600 font-medium">Current</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "preferences":
        return <PreferencesSettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 shrink-0">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}