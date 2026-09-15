
import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =========================================================
   ELEMENTS
========================================================= */

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const reportContainer = document.getElementById("reportContainer");

const toolbarTopic = document.getElementById("toolbarTopic");

const printBtn = document.getElementById("printBtn");
const pdfBtn = document.getElementById("pdfBtn");
const backBtn = document.getElementById("backBtn");

const reportToast = document.getElementById("reportToast");


/* =========================================================
   GET REPORT ID
========================================================= */

const params = new URLSearchParams(window.location.search);
const reportId = params.get("id");


/* =========================================================
   AUTH GUARD
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (!reportId) {
        showError("No case study ID was provided.");
        return;
    }

    await loadReport(user.uid);
});


/* =========================================================
   LOAD REPORT
========================================================= */

async function loadReport(userId) {

    try {

        const reportRef = doc(
            db,
            "generatedCaseStudies",
            reportId
        );

        const snapshot = await getDoc(reportRef);

        if (!snapshot.exists()) {
            throw new Error("Case study not found.");
        }

        const data = snapshot.data();

        if (data.userId !== userId) {
            throw new Error(
                "You do not have permission to view this report."
            );
        }

        renderReport(data);

    } catch (error) {

        console.error("Report loading error:", error);

        showError(
            error.message ||
            "Unable to load the case study."
        );
    }
}


/* =========================================================
   RENDER COMPLETE REPORT
========================================================= */

function renderReport(data) {

    const topic =
        data.topic ||
        "Cloud Computing Case Study";

    const category =
        data.category ||
        "Cloud Computing";

    const reportStyle =
        data.reportStyle ||
        "Academic";

    const createdDate =
        formatDate(data.createdAt);

    toolbarTopic.textContent = topic;

    reportContainer.innerHTML = "";

    /* -----------------------------------------------------
       TITLE PAGE
    ----------------------------------------------------- */

    const titlePage = document.createElement("section");

    titlePage.className = "title-page";

    titlePage.innerHTML = `
        <div class="title-top-line"></div>

        <div class="title-logo">
            <i class="bi bi-cloud-check-fill"></i>
        </div>

        <div class="report-label">
            CLOUDCASE AI
        </div>

        <h1>
            Professional Cloud Computing
            Case Study Report
        </h1>

        <div class="title-topic">
            ${escapeHTML(topic)}
        </div>

        <div class="title-meta">

            <div class="meta-item">
                <strong>Domain</strong>
                <span>${escapeHTML(category)}</span>
            </div>

            <div class="meta-item">
                <strong>Report Style</strong>
                <span>${escapeHTML(reportStyle)}</span>
            </div>

            <div class="meta-item">
                <strong>Generated On</strong>
                <span>${createdDate}</span>
            </div>

        </div>

        <div class="title-footer">
            Generated using CloudCase AI
            <br>
            Professional Cloud Computing Case Study Generator
        </div>
    `;

    reportContainer.appendChild(titlePage);


    /* -----------------------------------------------------
       TABLE OF CONTENTS
    ----------------------------------------------------- */

    const tocPage = createTableOfContents();

    reportContainer.appendChild(tocPage);


    /* -----------------------------------------------------
       CONTINUOUS REPORT BODY
    ----------------------------------------------------- */

    const reportBody = document.createElement("div");

    reportBody.className = "report-body";

    const sections =
        Array.isArray(data.reportContent)
            ? [...data.reportContent]
            : [];

    sections.sort(
        (a, b) =>
            Number(a.number || 0) -
            Number(b.number || 0)
    );


    sections.forEach((section) => {

        if (!section || section.number === 1) {
            return;
        }

        const sectionElement =
            createSection(section);

        reportBody.appendChild(sectionElement);
    });


    /* -----------------------------------------------------
       REPORT END
    ----------------------------------------------------- */

    const reportEnd =
        document.createElement("div");

    reportEnd.className = "report-end";

    reportEnd.innerHTML = `
        <strong>End of Case Study Report</strong>

        <p>
            Prepared using CloudCase AI —
            Professional Cloud Computing Case Study Generator
        </p>
    `;

    reportBody.appendChild(reportEnd);

    reportContainer.appendChild(reportBody);


    /* -----------------------------------------------------
       SHOW REPORT
    ----------------------------------------------------- */

    loadingState.hidden = true;

    reportContainer.hidden = false;
}


/* =========================================================
   TABLE OF CONTENTS
========================================================= */

function createTableOfContents() {

    const tocPage =
        document.createElement("section");

    tocPage.className = "toc-page";

    tocPage.innerHTML = `
        <h2>Table of Contents</h2>

        <p class="toc-subtitle">
            Structure of the Cloud Computing Case Study Report
        </p>

        <div class="toc-list"></div>
    `;

    const tocList =
        tocPage.querySelector(".toc-list");


    const tocSections = [

        {
            number: 2,
            title: "Abstract",
            description:
                "Executive summary of the selected cloud computing case study."
        },

        {
            number: 3,
            title: "Introduction",
            description:
                "Overview and importance of the selected cloud computing topic."
        },

        {
            number: 4,
            title: "Background / Domain Overview",
            description:
                "Background concepts, domain requirements and cloud context."
        },

        {
            number: 5,
            title: "Problem Statement",
            description:
                "Problem, limitations and requirements addressed by the solution."
        },

        {
            number: 6,
            title: "Existing System",
            description:
                "Traditional or existing approach and its limitations."
        },

        {
            number: 7,
            title: "Proposed Cloud Solution",
            description:
                "Proposed cloud-based approach and major solution components."
        },

        {
            number: 8,
            title: "Cloud Architecture",
            description:
                "Architecture, components and data flow of the proposed system."
        },

        {
            number: 9,
            title: "Technologies & Cloud Service Model",
            description:
                "Technologies, cloud services and service/deployment models."
        },

        {
            number: 10,
            title: "Working / Implementation",
            description:
                "Step-by-step working process and implementation approach."
        },

        {
            number: 11,
            title: "Security & Privacy",
            description:
                "Authentication, authorization, encryption and privacy considerations."
        },

        {
            number: 12,
            title: "Benefits",
            description:
                "Technical, operational and business benefits of the cloud solution."
        },

        {
            number: 13,
            title: "Challenges & Limitations",
            description:
                "Important technical, security, cost and operational challenges."
        },

        {
            number: 14,
            title: "Applications, Impact & Future Scope",
            description:
                "Applications, expected impact and future enhancement possibilities."
        },

        {
            number: 15,
            title: "Conclusion & References",
            description:
                "Final conclusion and reference sources for further study."
        }

    ];


    tocSections.forEach((item) => {

        const row =
            document.createElement("div");

        row.className = "toc-item";

        row.innerHTML = `
            <div class="toc-number">
                ${item.number}
            </div>

            <div>
                <div class="toc-title">
                    ${item.title}
                </div>

                <div class="toc-description">
                    ${item.description}
                </div>
            </div>

            <div class="toc-page-label">
                —
            </div>
        `;

        tocList.appendChild(row);
    });


    return tocPage;
}


/* =========================================================
   CREATE SECTION
========================================================= */

function createSection(section) {

    const wrapper =
        document.createElement("section");

    wrapper.className = "report-section";

    const number =
        section.number || "";

    const title =
        section.title || "Report Section";

    const content =
        section.content || "";


    wrapper.innerHTML = `
        <div class="report-section-header">

            <span class="section-number">
                Section ${escapeHTML(String(number))}
            </span>

            <h2>
                ${escapeHTML(title)}
            </h2>

        </div>

        <div class="section-content"></div>
    `;


    const contentContainer =
        wrapper.querySelector(".section-content");


    /* =====================================================
       ARCHITECTURE SECTION
    ===================================================== */

    if (
        Number(number) === 8 &&
        section.architecture
    ) {

        renderArchitecture(
            contentContainer,
            section
        );

    } else {

        renderNormalContent(
            contentContainer,
            content
        );
    }


    return wrapper;
}


/* =========================================================
   NORMAL CONTENT
========================================================= */

function renderNormalContent(
    container,
    content
) {

    if (!content) {
        return;
    }


    /*
       Supports paragraphs separated by blank lines.
    */

    const paragraphs =
        String(content)
            .split(/\n\s*\n/)
            .map(text => text.trim())
            .filter(Boolean);


    paragraphs.forEach((paragraph) => {

        const cleaned =
            paragraph
                .replace(/\r/g, "")
                .trim();


        if (!cleaned) {
            return;
        }


        /* ---------------------------------------------
           Bullet list
        --------------------------------------------- */

        if (
            cleaned
                .split("\n")
                .every(line =>
                    /^\s*[-•*]\s+/.test(line)
                )
        ) {

            const list =
                document.createElement("ul");

            list.className = "key-points";


            cleaned
                .split("\n")
                .forEach((line) => {

                    const text =
                        line
                            .replace(
                                /^\s*[-•*]\s+/,
                                ""
                            )
                            .trim();

                    if (!text) return;

                    const li =
                        document.createElement("li");

                    li.textContent = text;

                    list.appendChild(li);
                });


            container.appendChild(list);

            return;
        }


        /* ---------------------------------------------
           Simple table detection
        --------------------------------------------- */

        if (
            cleaned.includes("|") &&
            cleaned.split("\n").length >= 2
        ) {

            const table =
                createMarkdownTable(cleaned);

            if (table) {

                container.appendChild(table);

                return;
            }
        }


        /* ---------------------------------------------
           Heading detection
        --------------------------------------------- */

        if (
            cleaned.length < 100 &&
            (
                cleaned.endsWith(":") ||
                /^[A-Z][A-Za-z /&-]{2,70}$/.test(cleaned)
            )
        ) {

            const heading =
                document.createElement("h3");

            heading.textContent =
                cleaned.replace(/:$/, "");

            container.appendChild(heading);

            return;
        }


        /* ---------------------------------------------
           Regular paragraph
        --------------------------------------------- */

        const p =
            document.createElement("p");

        p.textContent = cleaned;

        container.appendChild(p);
    });
}


/* =========================================================
   MARKDOWN TABLE
========================================================= */

function createMarkdownTable(text) {

    const lines =
        text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);


    if (lines.length < 2) {
        return null;
    }


    const validLines =
        lines.filter(
            line => line.includes("|")
        );


    if (validLines.length < 2) {
        return null;
    }


    const tableWrapper =
        document.createElement("div");

    tableWrapper.className =
        "report-table-wrapper";


    const table =
        document.createElement("table");

    table.className =
        "report-table";


    const rows =
        validLines.map(line =>
            line
                .split("|")
                .map(cell => cell.trim())
                .filter(Boolean)
        );


    /* Remove markdown separator row */

    const filteredRows =
        rows.filter(row =>
            !row.every(cell =>
                /^:?-{2,}:?$/.test(cell)
            )
        );


    if (filteredRows.length < 2) {
        return null;
    }


    /* Header */

    const thead =
        document.createElement("thead");

    const headerRow =
        document.createElement("tr");


    filteredRows[0].forEach(cell => {

        const th =
            document.createElement("th");

        th.textContent = cell;

        headerRow.appendChild(th);
    });


    thead.appendChild(headerRow);

    table.appendChild(thead);


    /* Body */

    const tbody =
        document.createElement("tbody");


    filteredRows
        .slice(1)
        .forEach(row => {

            const tr =
                document.createElement("tr");


            row.forEach(cell => {

                const td =
                    document.createElement("td");

                td.textContent = cell;

                tr.appendChild(td);
            });


            tbody.appendChild(tr);
        });


    table.appendChild(tbody);

    tableWrapper.appendChild(table);


    return tableWrapper;
}


/* =========================================================
   ARCHITECTURE
========================================================= */

function renderArchitecture(
    container,
    section
) {

    const architecture =
        section.architecture || {};


    /* Introduction */

    if (section.content) {

        const intro =
            document.createElement("p");

        intro.textContent =
            section.content;

        container.appendChild(intro);
    }


    /* Architecture box */

    const architectureBox =
        document.createElement("div");

    architectureBox.className =
        "architecture-box";


    architectureBox.innerHTML = `
        <div class="architecture-title">
            ${escapeHTML(
                architecture.title ||
                "Proposed Cloud Architecture"
            )}
        </div>

        <div class="architecture-diagram">
            ${escapeHTML(
                architecture.diagram ||
                "Architecture diagram unavailable."
            )}
        </div>
    `;


    container.appendChild(architectureBox);


    /* Components */

    if (
        Array.isArray(
            architecture.components
        ) &&
        architecture.components.length
    ) {

        const heading =
            document.createElement("h3");

        heading.textContent =
            "Architecture Components";

        container.appendChild(heading);


        const grid =
            document.createElement("div");

        grid.className =
            "architecture-components";


        architecture.components
            .forEach(component => {

                const card =
                    document.createElement("div");

                card.className =
                    "architecture-component";


                if (
                    typeof component === "string"
                ) {

                    card.innerHTML = `
                        <strong>
                            ${escapeHTML(component)}
                        </strong>
                    `;

                } else {

                    card.innerHTML = `
                        <strong>
                            ${escapeHTML(
                                component.name ||
                                component.title ||
                                "Component"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                component.description ||
                                ""
                            )}
                        </span>
                    `;
                }


                grid.appendChild(card);
            });


        container.appendChild(grid);
    }


    /* Data Flow */

    if (architecture.dataFlow) {

        const dataFlow =
            document.createElement("div");

        dataFlow.className =
            "data-flow";


        dataFlow.innerHTML = `
            <strong>Data Flow</strong>

            <p>
                ${escapeHTML(
                    architecture.dataFlow
                )}
            </p>
        `;


        container.appendChild(dataFlow);
    }
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(timestamp) {

    try {

        if (!timestamp) {
            return "Not available";
        }


        let date;


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            date = timestamp.toDate();

        } else {

            date = new Date(timestamp);
        }


        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    } catch {
        return "Not available";
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    loadingState.hidden = true;

    reportContainer.hidden = true;

    errorMessage.textContent =
        message;

    errorState.hidden = false;
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    reportToast.textContent =
        message;

    reportToast.classList.add("show");


    setTimeout(() => {

        reportToast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   PRINT
========================================================= */

printBtn?.addEventListener(
    "click",
    () => {

        window.print();
    }
);


/* =========================================================
   SAVE AS PDF
========================================================= */

pdfBtn?.addEventListener(
    "click",
    () => {

        showToast(
            "Print dialog opened. Choose 'Save as PDF'."
        );

        setTimeout(() => {

            window.print();

        }, 300);
    }
);


/* =========================================================
   BACK
========================================================= */

backBtn?.addEventListener(
    "click",
    () => {

        window.history.back();
    }
);

