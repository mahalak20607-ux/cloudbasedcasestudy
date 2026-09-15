
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==========================================
// GLOBAL STATE
// ==========================================

let currentUser = null;
let allReports = [];
let filteredReports = [];


// ==========================================
// DOM ELEMENTS
// ==========================================

const loadingSection = document.getElementById("loadingSection");
const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");
const historyGrid = document.getElementById("historyGrid");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const totalReports = document.getElementById("totalReports");
const monthReports = document.getElementById("monthReports");
const topicReports = document.getElementById("topicReports");

const historyToast = document.getElementById("historyToast");


// ==========================================
// AUTHENTICATION
// ==========================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadReports();
});


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {
    showLoading();

    try {
        const reportsRef = collection(db, "generatedCaseStudies");

        // Only filter by userId.
        // Sorting is done locally to avoid requiring a Firestore
        // composite index for userId + createdAt.
        const reportsQuery = query(
            reportsRef,
            where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(reportsQuery);

        allReports = snapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data();

            return {
                id: documentSnapshot.id,
                ...data
            };
        });

        // Newest reports first
        allReports.sort((a, b) => {
            return getTimestampValue(b.createdAt) -
                   getTimestampValue(a.createdAt);
        });

        updateSummary();
        applyFilters();

    } catch (error) {
        console.error("Error loading case studies:", error);

        hideLoading();

        showToast(
            "Unable to load your case studies. Please check your Firebase configuration and Firestore rules.",
            "error"
        );

        showEmptyState();
    }
}


// ==========================================
// APPLY SEARCH + CATEGORY FILTER
// ==========================================

function applyFilters() {
    const searchTerm = (searchInput?.value || "")
        .trim()
        .toLowerCase();

    const selectedCategory = categoryFilter?.value || "all";

    filteredReports = allReports.filter((report) => {

        const reportContent = report.reportContent || {};

        const title =
            reportContent.title ||
            report.title ||
            "";

        const topic =
            reportContent.topic ||
            report.topic ||
            "";

        const category =
            reportContent.category ||
            report.category ||
            "";

        const searchableText = `
            ${title}
            ${topic}
            ${category}
        `.toLowerCase();

        const matchesSearch =
            !searchTerm ||
            searchableText.includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            normalizeCategory(category) ===
            normalizeCategory(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    renderReports();
}


// ==========================================
// RENDER REPORT CARDS
// ==========================================

function renderReports() {
    hideLoading();

    if (!historyGrid) {
        return;
    }

    historyGrid.innerHTML = "";

    // No reports at all
    if (allReports.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    // Reports exist, but filters found nothing
    if (filteredReports.length === 0) {
        showNoResults();
        return;
    }

    hideNoResults();

    filteredReports.forEach((report) => {
        const card = createReportCard(report);
        historyGrid.appendChild(card);
    });
}


// ==========================================
// CREATE REPORT CARD
// ==========================================

function createReportCard(report) {
    const reportContent = report.reportContent || {};

    const title =
        reportContent.title ||
        report.title ||
        "Untitled Case Study";

    const topic =
        reportContent.topic ||
        report.topic ||
        "Cloud Computing";

    const category =
        reportContent.category ||
        report.category ||
        "cloud-computing";

    const reportStyle =
        reportContent.reportStyle ||
        report.reportStyle ||
        "academic";

    const sections =
        Array.isArray(reportContent.sections)
            ? reportContent.sections
            : [];

    const createdDate = formatDate(
        report.createdAt ||
        reportContent.generatedDate
    );

    const card = document.createElement("article");

    card.className = "history-card";

    card.innerHTML = `
        <div class="history-card-top">

            <div class="history-card-icon">
                <i class="bi bi-file-earmark-text"></i>
            </div>

            <div class="history-card-category">
                ${escapeHTML(formatCategory(category))}
            </div>

        </div>

        <div class="history-card-body">

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p class="history-topic">
                <i class="bi bi-lightbulb"></i>
                ${escapeHTML(topic)}
            </p>

            <div class="history-meta">

                <span>
                    <i class="bi bi-calendar3"></i>
                    ${escapeHTML(createdDate)}
                </span>

                <span>
                    <i class="bi bi-layers"></i>
                    ${sections.length || 15} Sections
                </span>

                <span>
                    <i class="bi bi-file-text"></i>
                    ${escapeHTML(capitalize(reportStyle))}
                </span>

            </div>

        </div>

        <div class="history-card-footer">

            <button
                class="history-view-btn"
                type="button"
                data-action="view"
                data-id="${escapeHTML(report.id)}"
            >
                <i class="bi bi-eye"></i>
                View Report
            </button>

            <button
                class="history-delete-btn"
                type="button"
                data-action="delete"
                data-id="${escapeHTML(report.id)}"
                aria-label="Delete case study"
                title="Delete case study"
            >
                <i class="bi bi-trash3"></i>
            </button>

        </div>
    `;

    return card;
}


// ==========================================
// CARD BUTTON ACTIONS
// ==========================================

historyGrid?.addEventListener("click", async (event) => {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const reportId = button.dataset.id;

    if (!reportId) {
        return;
    }

    if (action === "view") {
        viewReport(reportId);
    }

    if (action === "delete") {
        await deleteReport(reportId);
    }
});


// ==========================================
// VIEW REPORT
// ==========================================

function viewReport(reportId) {
    window.location.href =
        `report.html?id=${encodeURIComponent(reportId)}`;
}


// ==========================================
// DELETE REPORT
// ==========================================

async function deleteReport(reportId) {

    const report = allReports.find(
        (item) => item.id === reportId
    );

    if (!report) {
        return;
    }

    const reportContent = report.reportContent || {};

    const title =
        reportContent.title ||
        report.title ||
        report.topic ||
        "this case study";

    const confirmed = window.confirm(
        `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, "generatedCaseStudies", reportId)
        );

        // Remove locally
        allReports = allReports.filter(
            (item) => item.id !== reportId
        );

        updateSummary();
        applyFilters();

        showToast(
            "Case study deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error("Delete error:", error);

        showToast(
            "Unable to delete the case study. Please try again.",
            "error"
        );
    }
}


// ==========================================
// UPDATE SUMMARY CARDS
// ==========================================

function updateSummary() {

    if (totalReports) {
        totalReports.textContent = allReports.length;
    }

    const now = new Date();

    const currentMonthCount = allReports.filter((report) => {

        const timestamp = getDateFromValue(report.createdAt);

        if (!timestamp) {
            return false;
        }

        return (
            timestamp.getMonth() === now.getMonth() &&
            timestamp.getFullYear() === now.getFullYear()
        );

    }).length;

    if (monthReports) {
        monthReports.textContent = currentMonthCount;
    }

    const uniqueTopics = new Set();

    allReports.forEach((report) => {

        const content = report.reportContent || {};

        const topic =
            content.topic ||
            report.topic ||
            "";

        const normalizedTopic =
            topic.trim().toLowerCase();

        if (normalizedTopic) {
            uniqueTopics.add(normalizedTopic);
        }
    });

    if (topicReports) {
        topicReports.textContent = uniqueTopics.size;
    }
}


// ==========================================
// SEARCH
// ==========================================

searchInput?.addEventListener("input", () => {
    applyFilters();
});


// ==========================================
// CATEGORY FILTER
// ==========================================

categoryFilter?.addEventListener("change", () => {
    applyFilters();
});


// ==========================================
// LOGOUT
// ==========================================

document.addEventListener("click", async (event) => {

    const logoutButton =
        event.target.closest(
            "#logoutBtn, [data-action='logout']"
        );

    if (!logoutButton) {
        return;
    }

    event.preventDefault();

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Logout error:", error);

        showToast(
            "Unable to sign out. Please try again.",
            "error"
        );
    }
});


// ==========================================
// LOADING STATE
// ==========================================

function showLoading() {

    if (loadingSection) {
        loadingSection.style.display = "flex";
    }

    if (historyGrid) {
        historyGrid.style.display = "none";
    }

    hideEmptyState();
    hideNoResults();
}


function hideLoading() {

    if (loadingSection) {
        loadingSection.style.display = "none";
    }

    if (historyGrid) {
        historyGrid.style.display = "grid";
    }
}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyState() {

    if (emptyState) {
        emptyState.style.display = "flex";
    }

    if (historyGrid) {
        historyGrid.style.display = "none";
    }

    hideNoResults();
}


function hideEmptyState() {

    if (emptyState) {
        emptyState.style.display = "none";
    }
}


// ==========================================
// NO RESULTS STATE
// ==========================================

function showNoResults() {

    if (noResults) {
        noResults.style.display = "flex";
    }

    if (historyGrid) {
        historyGrid.style.display = "none";
    }
}


function hideNoResults() {

    if (noResults) {
        noResults.style.display = "none";
    }
}


// ==========================================
// TOAST MESSAGE
// ==========================================

function showToast(message, type = "success") {

    if (!historyToast) {
        return;
    }

    historyToast.textContent = message;

    historyToast.className =
        `history-toast ${type} show`;

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        historyToast.classList.remove("show");
    }, 3500);
}


// ==========================================
// FIREBASE TIMESTAMP → NUMBER
// ==========================================

function getTimestampValue(value) {

    if (!value) {
        return 0;
    }

    if (typeof value.toMillis === "function") {
        return value.toMillis();
    }

    if (value instanceof Date) {
        return value.getTime();
    }

    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        const date = new Date(value);

        if (!Number.isNaN(date.getTime())) {
            return date.getTime();
        }
    }

    if (
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {
        return value.seconds * 1000;
    }

    return 0;
}


// ==========================================
// FIREBASE TIMESTAMP → DATE
// ==========================================

function getDateFromValue(value) {

    const timestamp = getTimestampValue(value);

    if (!timestamp) {
        return null;
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(value) {

    const date = getDateFromValue(value);

    if (!date) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ==========================================
// CATEGORY NORMALIZATION
// ==========================================

function normalizeCategory(category) {

    return String(category || "")
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-");
}


// ==========================================
// CATEGORY DISPLAY NAME
// ==========================================

function formatCategory(category) {

    const categoryMap = {
        "cloud-computing": "Cloud Computing",
        "cloud-storage": "Cloud Storage",
        "cloud-security": "Cloud Security",
        "cloud-services": "Cloud Services",
        "cloud-infrastructure": "Cloud Infrastructure",
        "cloud-development": "Cloud Development",
        "cloud-ai": "Cloud AI",
        "cloud-iot": "Cloud IoT",
        "cloud-healthcare": "Cloud Healthcare",
        "cloud-education": "Cloud Education",
        "cloud-business": "Cloud Business",
        "other": "Other"
    };

    const normalized = normalizeCategory(category);

    if (categoryMap[normalized]) {
        return categoryMap[normalized];
    }

    return String(category || "Cloud Computing")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


// ==========================================
// CAPITALIZE
// ==========================================

function capitalize(value) {

    const text = String(value || "");

    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}


// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

