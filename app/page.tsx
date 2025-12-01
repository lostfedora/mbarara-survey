"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

// Mbarara City Data
const DIVISION_CHOICES = ["South_Division", "North_Division"] as const;

const WARD_CHOICES = {
  South_Division: [
    "Kakoba Ward",
    "Nyamityobora Ward",
    "Katete Ward",
    "Ruti Ward",
    "Bugashe Ward",
    "Katojo Ward",
  ],
  North_Division: [
    "Rwenjeru Ward",
    "Nyabuhama Ward",
    "Biharwe East Ward",
    "Biharwe West Ward",
    "Kishasha Ward",
    "Kamukuzi Ward",
    "Ruharo Ward",
    "Kakiika Ward",
    "Rwemigina Ward",
  ],
} as const;

const CELL_CHOICES: Record<string, string[]> = {
  "Kakoba Ward": [
    "Kakoba Central",
    "Kakoba Quarters",
    "Kihindi",
    "Kisenyi A",
    "Kishwahili",
    "Kyapotani",
    "Lugazi",
    "N.T.C",
    "Nyakaizi",
    "Police/Prisons",
    "Rwentondo",
    "Mandela",
  ],
  "Nyamityobora Ward": [
    "Agip",
    "Central",
    "Kabateraine",
    "Kilembe",
    "Lower",
    "Lubiri",
    "Market",
    "Muti",
    "Survey",
    "Upper",
  ],
  "Katete Ward": [
    "Bihunya",
    "Karugangama",
    "Katete Central",
    "Kitebero",
    "Nsikye",
    "Nyamitanga",
    "Rwemirinzi",
    "Rwizi",
  ],
  "Ruti Ward": [
    "Kafunda",
    "Kateera",
    "Kirehe",
    "Market",
    "Nsikye",
    "Nyamitanga",
    "Rwizi",
    "Tankhill",
  ],
  "Bugashe Ward": [
    "Bugashe",
    "Kanyamurimi",
    "Kibaya I",
    "Kibaya II",
    "Kibona",
    "Nyakahanga",
    "Rutooma",
  ],
  "Katojo Ward": [
    "Karugyembe",
    "Kitojo",
    "Kibingo",
    "Kitagata",
    "Kitooma",
    "Ngaara",
    "Nyakashambya",
    "Rwariire I",
    "Rwariire II",
    "Rwemigina",
    "Rwentondo",
  ],
  "Rwenjeru Ward": [
    "Rwendama",
    "Rwenjeru South",
    "Kamatarisi",
    "Kabucebebe",
    "Rwakaterere",
    "Rwenjeru North",
    "Katengyeto",
    "Katerananga",
    "Akaku/Rwenjeru Wd",
  ],
  "Nyabuhama Ward": [
    "Ekigando",
    "Nyaruhanga",
    "Katojo",
    "Rugarama",
    "Kakukuru",
    "Rwebishekye",
  ],
  "Biharwe East Ward": [
    "Kyanyarukondo 1",
    "Rwemirabyo",
    "Rwenkanja",
    "Kasharara",
  ],
  "Biharwe West Ward": [
    "Biharwe East",
    "Biharwe Central 11",
    "Kyanyarukondo 11",
    "Ekihangire",
    "Mailo",
    "Biharwe West",
    "Biharwe Central 1",
    "Kanyara",
  ],
  "Kishasha Ward": [
    "Kyempitsi",
    "Kinyaza",
    "Nyakanengo",
    "Rwabukwire",
    "Rwobuyenje North",
    "Kibungo",
    "Rwobuyenje West",
    "Nyamabare",
  ],
  "Kamukuzi Ward": [
    "Biafra Cell",
    "Boma Cell",
    "Kakiika Cell",
    "Kakyeka Cell",
    "Kamukuzi Cell",
    "Kashanyarazi Cell",
    "Medical Cell",
    "Ntare Cell",
    "Rwebikoona Cell",
  ],
  "Ruharo Ward": [
    "Kiyanja Cell",
    "Mbaguta Cell",
    "Mbarara High School",
    "Nkokonjeru Cell",
    "Rwizi Cell",
  ],
  "Kakiika Ward": [
    "Makenke Cell",
    "Nyakabungo Cell",
    "Nyakiziba Cell",
    "Butagatsi Cell",
    "Kacence East Cell",
    "Kacence West Cell",
    "Rwobuyenje Cell",
  ],
  "Rwemigina Ward": [
    "Rwemigina Central Cell",
    "Kabingo Cell",
    "Rwebiihuro Cell",
    "Buremba I Cell",
    "Buremba II Cell",
    "Kenkombe Cell",
  ],
};

type FormState = {
  reporter: string;
  contact_us: string;
  developer_name: string;
  road_name: string;
  division: string;
  ward: string;
  cell: string;
  opposite_property_no: string;
  notes: string;
  latitude: string;
  longitude: string;
  google_maps_link: string;
};

export default function ConcernReportPage() {
  const [formData, setFormData] = useState<FormState>({
    reporter: "",
    contact_us: "",
    developer_name: "",
    road_name: "",
    division: "",
    ward: "",
    cell: "",
    opposite_property_no: "",
    notes: "",
    latitude: "",
    longitude: "",
    google_maps_link: "",
  });

  const [filteredWards, setFilteredWards] = useState<string[]>([]);
  const [filteredCells, setFilteredCells] = useState<string[]>([]);
  const [structurePhoto, setStructurePhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle dependent dropdowns
    if (name === "division") {
      const wards = (WARD_CHOICES as any)[value] || [];
      setFilteredWards(wards);
      setFilteredCells([]);
      setFormData((prev) => ({
        ...prev,
        ward: "",
        cell: "",
      }));
    } else if (name === "ward") {
      const cells = CELL_CHOICES[value] || [];
      setFilteredCells(cells);
      setFormData((prev) => ({
        ...prev,
        cell: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStructurePhoto(e.target.files[0]);
    } else {
      setStructurePhoto(null);
    }
  };

  const generateGoogleMapsLink = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=17&hl=en`;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported in this browser or is disabled.\n\n" +
          "Please:\n" +
          "• Make sure you are using a modern browser (Chrome, Edge, Firefox, Safari)\n" +
          "• Enable location services in your device settings\n" +
          "• Reload this page and try again."
      );
      setMessage("");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");
    setMessage("Getting your location...");

    // Clear any previous location data
    setFormData((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
      google_maps_link: "",
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const googleMapsLink = generateGoogleMapsLink(latitude, longitude);

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          google_maps_link: googleMapsLink,
        }));

        setLocationCaptured(true);
        setMessage("Location captured successfully!");
        setIsGettingLocation(false);
        setLocationError("");
      },
      (error) => {
        let errorMessage = "Geolocation error.\n\n";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Reason: You denied access to your location.\n\n" +
              "How to fix:\n" +
              "1. Click the lock icon in your browser address bar.\n" +
              "2. Find “Location” and change it to “Allow”.\n" +
              "3. Reload this page.\n" +
              "4. Tap “Capture Current Location” again while you are at the structure.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Reason: Location information is unavailable.\n\n" +
              "Possible causes:\n" +
              "• GPS is turned off or weak.\n" +
              "• You are indoors or the device cannot see satellites.\n" +
              "• Internet connection is unstable.\n\n" +
              "Try going outside or closer to a window, enable GPS, and try again.";
            break;
          case error.TIMEOUT:
            errorMessage +=
              "Reason: The location request took too long and timed out.\n\n" +
              "Try moving to an open area with better signal and tap “Capture Current Location” again.";
            break;
          default:
            errorMessage +=
              "Reason: An unknown error occurred.\n\nPlease try again, or capture the GPS coordinates manually if possible.";
            break;
        }

        setLocationError(errorMessage);
        setMessage("");
        setIsGettingLocation(false);
        setLocationCaptured(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const formatServerErrorDetails = (data: any): string => {
    if (!data) return "No additional details were provided by the server.";

    if (typeof data === "object") {
      const lines: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        const fieldName =
          key === "non_field_errors" ? "General" : key.replace(/_/g, " ");

        if (Array.isArray(value)) {
          lines.push(`${fieldName}: ${value.join(", ")}`);
        } else if (typeof value === "string") {
          lines.push(`${fieldName}: ${value}`);
        } else {
          lines.push(`${fieldName}: ${JSON.stringify(value)}`);
        }
      }

      if (lines.length > 0) return lines.join("\n");
    }

    return typeof data === "string" ? data : JSON.stringify(data, null, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationCaptured && !isGettingLocation) {
      // Try to capture location if not done yet
      getCurrentLocation();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (val) {
          submitData.append(key, val);
        }
      });

      if (structurePhoto) {
        submitData.append("structure_photo", structurePhoto);
      }

      const response = await axios.post(
        "https://mbararacityinfrastructure.com/api/concerns/",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setMessage(
          "Concern submitted successfully!\n\n" +
            "Thank you for reporting this issue. Your information has been received by Mbarara City Administration."
        );
        setFormData({
          reporter: "",
          contact_us: "",
          developer_name: "",
          road_name: "",
          division: "",
          ward: "",
          cell: "",
          opposite_property_no: "",
          notes: "",
          latitude: "",
          longitude: "",
          google_maps_link: "",
        });
        setStructurePhoto(null);
        setFilteredWards([]);
        setFilteredCells([]);
        setLocationCaptured(false);
        setLocationError("");
        const fileInput = document.getElementById(
          "structure_photo"
        ) as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Concern submission failed:", error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        let friendlyMessage = `Error: The server rejected your request.\n\n`;
        friendlyMessage += `Status code: ${status}\n`;

        if (status === 400) {
          friendlyMessage +=
            "\nReason: Some of the information you submitted is invalid or missing.\n\n" +
            "What you can do:\n" +
            "• Check the fields marked with * (required).\n" +
            "• Make sure your contact information and location details are correct.\n\n" +
            "Details from the server:\n" +
            formatServerErrorDetails(data);
        } else if (status === 413) {
          friendlyMessage +=
            "\nReason: The uploaded file may be too large.\n\n" +
            "What you can do:\n" +
            "• Reduce the image size or resolution.\n" +
            "• Try uploading a smaller photo.\n\n" +
            "Technical details:\n" +
            formatServerErrorDetails(data);
        } else if (status >= 500) {
          friendlyMessage +=
            "\nReason: Internal server error.\n\n" +
            "This is a problem on the server side, not with your browser.\n\n" +
            "What you can do:\n" +
            "• Try again after a few minutes.\n" +
            "• If it continues, inform the system administrator.\n\n" +
            "Technical details:\n" +
            formatServerErrorDetails(data);
        } else {
          friendlyMessage +=
            "\nReason: Unexpected server response.\n\n" +
            "Details from the server:\n" +
            formatServerErrorDetails(data);
        }

        setMessage(friendlyMessage);
      } else if (error.request) {
        const networkMessage =
          "Error: Network problem while submitting your concern.\n\n" +
          "Your browser tried to contact the server at:\n" +
          "https://mbararacityinfrastructure.com/api/concerns/\n\n" +
          "But no response was received.\n\n" +
          "Possible causes:\n" +
          "• You are offline or your internet is unstable.\n" +
          "• The server is temporarily down.\n" +
          "• There is a CORS / SSL configuration issue on the server.\n\n" +
          "What you can do:\n" +
          "• Check that you are connected to the internet.\n" +
          "• Reload the page and try again.\n" +
          "• If the problem repeats, contact the system administrator.";
        setMessage(networkMessage);
      } else {
        const genericMessage =
          "Error: Something went wrong before the request was sent.\n\n" +
          `Details: ${error.message}\n\n` +
          "What you can do:\n" +
          "• Reload this page and try again.\n" +
          "• If this keeps happening, contact the system administrator with this error message.";
        setMessage(genericMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Head>
        <title>Report Concern - Mbarara City</title>
        <meta
          name="description"
          content="Report a concern to Mbarara City authorities"
        />
      </Head>

      {/* Top Brand Bar with Logo */}
      <header className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-blue-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-blue-200 dark:border-gray-700 bg-white">
              <Image
                src="/logo.jpg"
                alt="Mbarara City Logo"
                fill
                className="object-contain p-1"
                sizes="40px"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm uppercase tracking-widest text-blue-600 dark:text-blue-300 font-semibold">
                Mbarara City
              </span>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                Infrastructure &amp; Urban Development
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-blue-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100 dark:border-gray-700"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Report a Concern
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Help us improve Mbarara City by reporting illegal, unsafe or
              unplanned structures.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl border border-blue-50 dark:border-gray-700">
            {/* Card header */}
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 sm:px-8 py-4 bg-blue-50/70 dark:bg-gray-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Concern Reporting Form
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </p>
              </div>
              <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Secure online submission
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Global Message */}
              {message && (
                <div
                  className={`p-4 mb-2 rounded-xl border whitespace-pre-line text-sm sm:text-[13px] leading-relaxed ${
                    message.includes("Error")
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                      : message.includes("Getting your location") ||
                        message.includes("captured successfully") ||
                        message.includes("received by Mbarara City Administration")
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                  }`}
                >
                  <div className="flex items-start">
                    {message.includes("Error") ? (
                      <svg
                        className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : message.includes("Getting your location") ||
                      message.includes("captured successfully") ? (
                      <svg
                        className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{message}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reporter Information */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-200">
                      1
                    </span>
                    Reporter Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Reporter Name
                      </label>
                      <input
                        type="text"
                        name="reporter"
                        value={formData.reporter}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200"
                        placeholder="Enter your full name (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Contact Info <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contact_us"
                        value={formData.contact_us}
                        onChange={handleInputChange}
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200"
                        placeholder="Phone number or email (for follow-up)"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        We&apos;ll use this to contact you about this concern
                        (e.g. 0781..., +256..., or your email address).
                      </p>
                    </div>
                  </div>
                </section>

                {/* Developer / Structure Information */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-200">
                      2
                    </span>
                    Structure / Developer Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Developer Name
                      </label>
                      <input
                        type="text"
                        name="developer_name"
                        value={formData.developer_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200"
                        placeholder="Developer or property owner name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Road Name
                      </label>
                      <input
                        type="text"
                        name="road_name"
                        value={formData.road_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200"
                        placeholder="Road name where structure is located"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Opposite Property Number
                    </label>
                    <input
                      type="text"
                      name="opposite_property_no"
                      value={formData.opposite_property_no}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200"
                      placeholder="Property number opposite the structure"
                    />
                  </div>
                </section>

                {/* Administrative Division */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-200">
                      3
                    </span>
                    Administrative Location
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-600 space-y-4">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Select the Division, Ward and Cell where the structure is
                      located.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Division <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="division"
                          value={formData.division}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm transition-all duration-200"
                        >
                          <option value="">Select Division</option>
                          {DIVISION_CHOICES.map((division) => (
                            <option key={division} value={division}>
                              {division.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Ward <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.division}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Ward</option>
                          {filteredWards.map((ward) => (
                            <option key={ward} value={ward}>
                              {ward}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Cell <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="cell"
                          value={formData.cell}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.ward}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Cell</option>
                          {filteredCells.map((cell) => (
                            <option key={cell} value={cell}>
                              {cell}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Location Capture Section */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-200">
                      4
                    </span>
                    GPS Location
                  </h2>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-left space-y-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Capture structure location using your device GPS
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Stand as close as possible to the structure before
                          capturing, so that the coordinates are accurate.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation || locationCaptured}
                        className="mt-2 sm:mt-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGettingLocation ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Getting Location...</span>
                          </>
                        ) : locationCaptured ? (
                          <>
                            <svg
                              className="w-4 h-4 text-green-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Location Captured</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Capture Current Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error / success details */}
                    {locationError && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-left whitespace-pre-line">
                        <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start">
                          <svg
                            className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {locationError}
                        </p>
                      </div>
                    )}

                    {locationCaptured && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div className="bg-white/80 dark:bg-gray-900/60 rounded-lg px-3 py-2 border border-green-200 dark:border-green-700 flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">
                            Latitude
                          </span>
                          <span className="font-mono text-green-700 dark:text-green-300 text-xs">
                            {formData.latitude}
                          </span>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-900/60 rounded-lg px-3 py-2 border border-green-200 dark:border-green-700 flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">
                            Longitude
                          </span>
                          <span className="font-mono text-green-700 dark:text-green-300 text-xs">
                            {formData.longitude}
                          </span>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-900/60 rounded-lg px-3 py-2 border border-green-200 dark:border-green-700 flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 mb-1">
                            Map Link
                          </span>
                          {formData.google_maps_link ? (
                            <a
                              href={formData.google_maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-300 underline text-xs break-all"
                            >
                              Open in Google Maps
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">
                              Not available
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* File Upload */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-200">
                      5
                    </span>
                    Photos & Notes
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Structure Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600 bg-gray-50/60 dark:bg-gray-900/30">
                      <input
                        type="file"
                        id="structure_photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="structure_photo"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg
                          className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {structurePhoto
                            ? structurePhoto.name
                            : "Click to upload structure photo (optional)"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          JPEG or PNG, preferably less than 5MB.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200 resize-none"
                      placeholder="Provide additional details about your concern (e.g. type of risk, nearby landmarks, any people at risk)..."
                    />
                  </div>
                </section>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3.5 px-6 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Concern Report"
                    )}
                  </button>
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 text-center">
                    By submitting this form, you confirm that the information
                    provided is true to the best of your knowledge.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Mbarara City Administration &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
