
import { auth, db } from "./firebase-config.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =========================================================
   ELEMENTS
========================================================= */

const generatorForm = document.getElementById("generatorForm");
const topicInput = document.getElementById("topic");
const categoryInput = document.getElementById("category");
const reportDepthInput = document.getElementById("reportDepth");
const generateBtn = document.getElementById("generateBtn");
const includeArchitectureInput =
    document.getElementById("includeArchitecture");

const generationModal =
    document.getElementById("generationModal");

const charCount =
    document.getElementById("charCount");

const architecturePreview =
    document.getElementById("architecturePreview");


/* =========================================================
   AUTH GUARD
========================================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
});


/* =========================================================
   CHARACTER COUNTER
========================================================= */

topicInput?.addEventListener("input", () => {

    const length =
        topicInput.value.trim().length;

    if (charCount) {
        charCount.textContent =
            `${length} characters`;
    }

    updateArchitecturePreview();
});


/* =========================================================
   ARCHITECTURE PREVIEW
========================================================= */

includeArchitectureInput?.addEventListener(
    "change",
    updateArchitecturePreview
);

categoryInput?.addEventListener(
    "change",
    updateArchitecturePreview
);

function updateArchitecturePreview() {

    if (!architecturePreview) {
        return;
    }

    const topic =
        topicInput?.value.trim() ||
        "Your Cloud Computing Topic";

    const category =
        categoryInput?.value ||
        "general";

    const architecture =
        createArchitecture(
            topic,
            category
        );

    architecturePreview.textContent =
        architecture.diagram;
}


/* =========================================================
   FORM SUBMIT
========================================================= */

generatorForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (!currentUser) {
            showMessage(
                "Please login before generating a report."
            );
            return;
        }


        const topic =
            topicInput.value.trim();


        if (topic.length < 5) {

            showMessage(
                "Please enter a meaningful Cloud Computing topic."
            );

            topicInput.focus();

            return;
        }


        const category =
            categoryInput?.value ||
            "general";


        const depth =
            reportDepthInput?.value ||
            "detailed";


        const styleElement =
            document.querySelector(
                'input[name="reportStyle"]:checked'
            );


        const reportStyle =
            styleElement?.value ||
            "professional";


        const includeArchitecture =
            includeArchitectureInput
                ? includeArchitectureInput.checked
                : true;


        try {

            setGeneratingState(true);


            /*
             * Generate detailed academic content.
             */
            const architecture =
                createArchitecture(
                    topic,
                    category
                );


            const allSections =
                createDetailedReport(
                    topic,
                    category,
                    reportStyle,
                    architecture,
                    includeArchitecture
                );


            /*
             * For the professional report,
             * keep all 15 sections.
             *
             * Even if the user selects standard/summary,
             * we still generate enough content so
             * the final PDF looks like a proper case study.
             */
            const reportContent =
                applyDepth(
                    allSections,
                    depth
                );


            /*
             * Save to Firestore.
             */
            const reportRef =
                await addDoc(
                    collection(
                        db,
                        "generatedCaseStudies"
                    ),
                    {
                        userId:
                            currentUser.uid,

                        userEmail:
                            currentUser.email || "",

                        topic,

                        category,

                        reportStyle,

                        reportDepth:
                            depth,

                        includeArchitecture,

                        architecture,

                        reportContent,

                        totalSections:
                            reportContent.length,

                        status:
                            "completed",

                        createdAt:
                            serverTimestamp()
                    }
                );


            /*
             * Redirect to report.
             */
            window.location.href =
                `report.html?id=${reportRef.id}`;


        } catch (error) {

            console.error(
                "Report generation error:",
                error
            );

            setGeneratingState(false);

            showMessage(
                error.message ||
                "Unable to generate the case study."
            );
        }
    }
);


/* =========================================================
   DETAILED REPORT GENERATOR
========================================================= */

function createDetailedReport(
    topic,
    category,
    reportStyle,
    architecture,
    includeArchitecture
) {

    const categoryName =
        getCategoryName(category);


    return [

        /* =================================================
           SECTION 1
        ================================================= */

        {
            number: 1,

            title: "Title Page",

            content:
                `Professional Cloud Computing Case Study Report\n\n${topic}\n\nDomain: ${categoryName}\nReport Style: ${reportStyle}`,

            architecture: null
        },


        /* =================================================
           SECTION 2
        ================================================= */

        {
            number: 2,

            title: "Abstract",

            content: `
This case study presents a comprehensive analysis of ${topic} in the context of modern cloud computing. Cloud computing provides an elastic and distributed computing environment in which organizations can access computing resources, storage, networking, software platforms and intelligent services through internet-based infrastructure. The combination of cloud computing with ${topic} creates an environment capable of supporting scalable applications, large-scale data processing, intelligent decision-making and continuous service delivery.

The proposed case study examines how cloud infrastructure can be designed and used to support ${topic}. It considers the major components involved in the solution, including users, application interfaces, authentication services, application processing, databases, cloud storage, monitoring services and security controls. The study also examines how these components communicate with each other and how cloud service models can be selected according to application requirements.

A major objective of this case study is to demonstrate that cloud computing can reduce infrastructure limitations while improving scalability, availability, flexibility and operational efficiency. Instead of maintaining all computing resources locally, organizations can dynamically allocate resources based on workload requirements. This becomes particularly useful for ${topic}, where data volume, computational requirements and user demand may change over time.

The study further evaluates security and privacy requirements, implementation challenges, operational limitations and possible future enhancements. Identity and access management, encryption, secure APIs, monitoring, backup mechanisms and responsible data handling are considered essential elements of the proposed solution.

Overall, this case study demonstrates how ${topic} can be implemented using cloud-based technologies to create a scalable, secure and efficient computing environment. The proposed approach can be adapted to academic projects, enterprise applications, research environments and real-world digital services.
`
        },


        /* =================================================
           SECTION 3
        ================================================= */

        {
            number: 3,

            title: "Introduction",

            content: `
Cloud computing has become one of the most important technologies in modern information technology. Traditional computing environments require organizations to purchase, configure and maintain physical servers, networking equipment, storage systems and software infrastructure. Such infrastructure can be expensive and difficult to scale when application requirements change. Cloud computing addresses these limitations by providing computing resources as services over a network.

The rapid growth of digital applications has increased the demand for scalable and flexible computing environments. Applications are now expected to support large numbers of users, process increasing volumes of data and remain available for extended periods. Cloud platforms provide infrastructure and services that help developers achieve these requirements without managing every physical component directly.

${topic} represents an important application area where cloud computing can provide significant advantages. Depending on the application scenario, the cloud can provide computing power, storage, databases, networking, analytics, security and application development services. These resources can be provisioned according to workload requirements.

In a conventional environment, an organization may need to estimate future capacity before deploying an application. If the estimate is too high, resources remain underutilized. If the estimate is too low, performance problems may occur when demand increases. Cloud computing introduces elasticity, allowing resources to be increased or reduced according to workload.

Another important characteristic is accessibility. Cloud-hosted applications can generally be accessed from multiple locations and devices when appropriate network connectivity and security controls are available. This supports remote collaboration, distributed teams and digital services.

For ${topic}, cloud computing can also support integration with advanced technologies such as artificial intelligence, machine learning, big data analytics, Internet of Things platforms, serverless computing and managed databases. These services can reduce development complexity and allow organizations to focus on application functionality rather than physical infrastructure.

This case study therefore investigates a complete cloud-based approach for ${topic}, including its background, problem statement, proposed architecture, technologies, implementation, security, benefits, limitations, applications and future scope.
`
        },


        /* =================================================
           SECTION 4
        ================================================= */

        {
            number: 4,

            title: "Background / Domain Overview",

            content: `
The background of ${topic} can be understood by examining the evolution of computing from local infrastructure to distributed and cloud-based environments. Earlier systems depended heavily on local servers and dedicated hardware. Organizations were responsible for purchasing equipment, installing operating systems, configuring networks and maintaining physical infrastructure.

With virtualization and distributed computing, multiple workloads could be executed on shared physical resources. Virtual machines allowed better utilization of hardware and introduced greater flexibility. Cloud computing extended this concept by making computing resources available as on-demand services.

The cloud computing domain generally includes three major service models: Infrastructure as a Service, Platform as a Service and Software as a Service. Infrastructure as a Service provides fundamental computing resources such as virtual machines, storage and networking. Platform as a Service provides managed environments for developing and deploying applications. Software as a Service delivers complete software applications to end users.

Cloud deployment can also be categorized into public, private, hybrid and community-oriented environments. Public cloud infrastructure is shared among multiple customers through a cloud provider. Private cloud infrastructure is dedicated to a particular organization. Hybrid environments combine multiple infrastructure types to support different operational requirements.

For ${topic}, the selection of a cloud model depends on factors such as data sensitivity, workload characteristics, regulatory requirements, budget, performance expectations and organizational policies.

The domain also involves several supporting technologies. Databases provide structured data management, object storage handles files and large datasets, content delivery networks improve access speed, monitoring services observe application health and identity services control access.

Modern cloud environments increasingly provide specialized services for artificial intelligence, machine learning, analytics and automation. These managed services can support ${topic} by reducing the infrastructure and configuration effort required by developers.

The background analysis indicates that cloud computing is not simply a replacement for physical servers. It represents a service-oriented approach to computing in which infrastructure capabilities are provisioned dynamically and integrated through APIs and managed services.
`
        },


        /* =================================================
           SECTION 5
        ================================================= */

        {
            number: 5,

            title: "Problem Statement",

            content: `
Organizations implementing ${topic} may face several technical and operational challenges when using traditional infrastructure. The first major problem is scalability. Application workloads may increase significantly during peak usage periods, while fixed infrastructure may not have sufficient capacity to handle the additional demand.

A second problem is infrastructure cost. Organizations must often purchase hardware before knowing the exact future workload. Hardware maintenance, power consumption, cooling, networking and physical security also contribute to operational expenses.

Data management is another important concern. Applications associated with ${topic} may generate or consume large quantities of structured and unstructured information. Local storage can become difficult to expand and maintain when data volume grows continuously.

Availability is also critical. If a local server fails, applications hosted on that server may become unavailable. Organizations therefore require redundancy, backup and disaster recovery mechanisms to maintain service continuity.

Security presents another challenge. Sensitive information must be protected from unauthorized access, accidental exposure and malicious activity. Authentication, authorization, encryption, secure communication and monitoring are required to reduce security risks.

Traditional environments may also make rapid experimentation difficult. Developers may have to manually configure infrastructure before testing a new application or service. This can increase development time.

The problem addressed by this case study is therefore the design of a scalable, secure, flexible and cost-efficient cloud-based environment capable of supporting ${topic} while maintaining reliable access to application resources and data.

The proposed approach attempts to solve these challenges by using cloud infrastructure, managed services, automated resource provisioning, secure access mechanisms, scalable storage and monitoring capabilities.
`
        },


        /* =================================================
           SECTION 6
        ================================================= */

        {
            number: 6,

            title: "Existing System",

            content: `
The existing approach for implementing ${topic} may rely on local servers, manually configured infrastructure or isolated software environments. In such systems, computing resources are generally owned and managed directly by the organization.

Users access the application through a local network or internet-facing server. Application processing is performed on dedicated machines and data may be stored in local databases or storage devices. Backup and disaster recovery are often handled separately.

Although this model provides direct control over infrastructure, it creates several limitations. Hardware capacity is fixed and increasing capacity may require purchasing additional equipment. The procurement process can take significant time and increase operational cost.

Another limitation is maintenance. Server operating systems, databases, network equipment and security systems must be regularly updated. Skilled administrators may be required to monitor and maintain these resources.

The existing approach can also result in poor resource utilization. During periods of low demand, servers may remain underused while still consuming electricity and requiring maintenance.

Availability can also become a concern if the application depends on a small number of physical servers. Hardware failure may cause service interruption unless redundant infrastructure has been deployed.

Data backup can become difficult as data volume increases. Organizations need reliable backup policies and recovery mechanisms to protect information from hardware failure or accidental deletion.

The existing system therefore provides basic functionality but may not efficiently address the scalability, flexibility, availability and operational requirements of modern ${topic} applications.

A cloud-based approach can overcome several of these limitations by introducing elastic resources, managed services, automated backups, distributed infrastructure and centralized monitoring.
`
        },


        /* =================================================
           SECTION 7
        ================================================= */

        {
            number: 7,

            title: "Proposed Cloud Solution",

            content: `
The proposed solution uses cloud computing as the primary infrastructure for implementing ${topic}. Instead of depending completely on local servers, application services are deployed using cloud-based computing, storage, database and networking resources.

The system begins with an end user accessing the application through a web or mobile interface. The request is securely transmitted to the cloud environment through an application interface or API gateway.

An authentication service verifies the user's identity and determines whether the user is authorized to access the requested resources. After successful authentication, the request is forwarded to the application processing layer.

The application layer contains the business logic required by ${topic}. Depending on the use case, this layer may communicate with databases, object storage, analytics services, artificial intelligence services or other cloud APIs.

The database layer stores structured application information. Object storage can be used for documents, datasets, images, models, logs or other large files.

A security layer protects communication and resources. Encryption can be used for data in transit and at rest, while identity and access management policies restrict users and services to only the permissions they require.

Monitoring and logging services continuously observe system performance. Metrics such as CPU utilization, memory consumption, request latency, error rate and resource usage can be collected for operational analysis.

The architecture is designed to support scalability. When demand increases, additional cloud resources can be provisioned. When demand decreases, resources can be reduced where supported by the selected service.

The proposed solution therefore provides a complete cloud-based environment for ${topic}, combining application services, storage, databases, security, monitoring and scalable infrastructure.
`
        },


        /* =================================================
           SECTION 8
        ================================================= */

        {
            number: 8,

            title: "Cloud Architecture",

            content: `
The cloud architecture for ${topic} follows a layered design. Each layer performs a specific responsibility while communicating with other layers through controlled interfaces.

The user interaction layer provides web or mobile access. Users submit requests, view results and interact with application features through this layer.

The authentication and API layer manages identity verification and request routing. APIs provide controlled communication between the client application and cloud services.

The application processing layer performs the primary business operations. For an artificial intelligence application, this layer may prepare input data, communicate with AI models, perform inference and return results.

The data layer contains managed databases and cloud storage. Structured information can be stored in databases while large files and datasets can be stored in object storage.

The security layer protects all major components through identity management, encryption, access control and monitoring.

The monitoring layer collects operational information and supports performance management, troubleshooting and security analysis.
`
                ,
            architecture:
                includeArchitecture
                    ? architecture
                    : null
        },


        /* =================================================
           SECTION 9
        ================================================= */

        {
            number: 9,

            title: "Technologies & Cloud Service Model",

            content: `
The implementation of ${topic} can use a combination of cloud computing technologies and managed services. The exact technology selection depends on application requirements, but a typical solution contains cloud computing, storage, database, networking, security and monitoring services.

Infrastructure as a Service can be used when the application requires control over virtual machines, operating systems and networking configurations. Platform as a Service can reduce infrastructure management by providing managed application deployment environments.

Software as a Service can be used when complete software functionality is available as a managed cloud application.

For data management, cloud databases provide scalable storage and managed database operations. Object storage can handle large files and datasets.

For applications involving artificial intelligence, cloud AI and machine learning services can provide model training, inference, natural language processing, computer vision and other capabilities.

Serverless computing is another possible technology. Serverless functions execute application logic without requiring developers to continuously manage servers. Functions can be triggered by API requests, file uploads, database changes or scheduled events.

Container technologies can package applications with their dependencies and make deployment more consistent across environments.

Cloud networking technologies provide virtual networks, subnets, routing, firewalls and controlled communication between services.

Monitoring and logging technologies provide visibility into application health and resource usage.

The technology selection should consider cost, scalability, performance, security, vendor support, integration requirements and developer expertise.
`
        },


        /* =================================================
           SECTION 10
        ================================================= */

        {
            number: 10,

            title: "Working / Implementation",

            content: `
The working process begins when the user accesses the ${topic} application through a web or mobile interface. The client application sends a request to the cloud environment through a secure connection.

Step 1: User Authentication. The user provides authentication information. The identity service validates the credentials and establishes an authenticated session.

Step 2: Request Submission. The authenticated user submits data or requests a specific operation related to ${topic}. The request is transmitted to the cloud application layer through a secure API.

Step 3: Input Validation. The application validates the received information before processing. Invalid or incomplete requests are rejected to maintain data quality and application security.

Step 4: Application Processing. The cloud application executes the required business logic. If the application involves artificial intelligence, the input may be transformed into a format suitable for an AI model.

Step 5: AI or Computational Processing. The relevant cloud service performs the required computation. Depending on the application, this may include prediction, classification, recommendation, natural language processing, image analysis or another intelligent operation.

Step 6: Data Storage. Relevant information is stored in a cloud database or object storage system. Data retention policies determine how long information should be maintained.

Step 7: Response Generation. The processed result is returned to the application layer and then delivered to the authenticated user.

Step 8: Monitoring. Application logs and performance metrics are collected by monitoring services. Administrators can use these metrics to identify failures and performance problems.

Step 9: Scaling. When workload increases, cloud resources can scale according to configured policies. This allows the application to support changing demand.

Step 10: Backup and Recovery. Important data is backed up according to an established recovery policy. Backup mechanisms help restore services after accidental deletion, infrastructure failure or other incidents.

This workflow demonstrates how multiple cloud services can cooperate to deliver a complete application environment for ${topic}.
`
        },


        /* =================================================
           SECTION 11
        ================================================= */

        {
            number: 11,

            title: "Security & Privacy",

            content: `
Security is a fundamental requirement for the proposed cloud solution. Because application data and services are hosted in a shared cloud environment, appropriate security controls must be implemented throughout the system.

Authentication ensures that only registered users can access the application. Multi-factor authentication can provide an additional layer of protection for sensitive systems.

Authorization determines what an authenticated user is allowed to access. Role-based access control can assign permissions according to user responsibilities.

Encryption protects information from unauthorized access. Data should be encrypted during transmission using secure communication protocols. Sensitive stored information should also be protected using encryption mechanisms supported by the cloud platform.

Identity and Access Management policies should follow the principle of least privilege. Users and application services should receive only the permissions required for their tasks.

API security is also important. APIs should validate requests, enforce authentication and authorization, apply rate limits where appropriate and reject malformed input.

Network security can be implemented using virtual networks, firewalls, private subnets and controlled security rules.

Logging and monitoring support security operations. Suspicious authentication attempts, unusual API activity and unexpected resource usage can be identified through appropriate monitoring systems.

Privacy must also be considered when handling personal or sensitive information. Organizations should collect only necessary information, define retention policies and restrict access to sensitive data.

Backup systems must also be protected. Backup copies should have appropriate access controls so that an attacker cannot easily compromise both the primary data and its backups.

Security should therefore be treated as a continuous process rather than a one-time configuration. Regular reviews, vulnerability assessments, access audits and security updates are required.
`
        },


        /* =================================================
           SECTION 12
        ================================================= */

        {
            number: 12,

            title: "Benefits",

            content: `
The proposed cloud-based implementation of ${topic} provides several technical, operational and organizational benefits.

Scalability is one of the most important benefits. Cloud resources can be adjusted according to workload requirements, allowing applications to handle changing levels of demand.

Cost efficiency can be improved because organizations can use cloud resources according to actual requirements rather than maintaining large amounts of unused physical infrastructure.

High availability can be achieved by using distributed and redundant cloud services. Depending on the architecture, workloads can be deployed across multiple availability zones or regions.

Flexibility is another major benefit. Developers can provision computing resources, databases and storage services without purchasing physical hardware.

Cloud services also support faster development. Managed databases, authentication services, AI APIs and serverless platforms reduce the amount of infrastructure that developers need to configure manually.

Global accessibility allows authorized users to access cloud-hosted applications from different locations when appropriate connectivity and security policies are available.

Centralized monitoring improves operational visibility. Administrators can observe resource utilization, application performance and errors through cloud monitoring tools.

Cloud backup and disaster recovery mechanisms can improve data protection and service continuity.

For ${topic}, cloud infrastructure also makes it easier to integrate emerging technologies such as AI, machine learning, analytics, automation and Internet of Things services.

The major benefits can therefore be summarized as scalability, flexibility, availability, cost optimization, faster deployment, managed infrastructure, improved monitoring and easier technology integration.
`
        },


        /* =================================================
           SECTION 13
        ================================================= */

        {
            number: 13,

            title: "Challenges & Limitations",

            content: `
Although cloud computing provides significant advantages, implementing ${topic} in the cloud also introduces challenges.

The first challenge is internet dependency. Cloud applications generally require reliable network connectivity. Network failures can affect application access.

Security configuration is another challenge. Cloud platforms provide many security controls, but incorrect configuration can create vulnerabilities. Organizations therefore require appropriate knowledge and security policies.

Cost management can also become difficult. Although cloud computing can reduce infrastructure costs, unnecessary resources, excessive data transfer, unused storage and poorly configured services can increase expenses.

Vendor dependency is another limitation. Applications designed around provider-specific services may become difficult to migrate to another cloud provider.

Data privacy and regulatory requirements may impose additional restrictions, especially when sensitive or personal information is processed.

Performance can also vary depending on network latency, resource configuration and workload characteristics.

AI-based cloud applications may have additional challenges related to data quality, model accuracy, computational cost, model monitoring and responsible use of automated decisions.

Technical skills are required to manage cloud infrastructure effectively. Developers and administrators may need knowledge of cloud architecture, networking, security, databases and monitoring.

Disaster recovery planning is also important. Cloud availability does not automatically eliminate every possible failure. Organizations must design suitable backup and recovery strategies.

These challenges can be reduced through proper architecture design, cost monitoring, security reviews, staff training, documentation, backup strategies and continuous system evaluation.
`
        },


        /* =================================================
           SECTION 14
        ================================================= */

        {
            number: 14,

            title: "Applications, Impact & Future Scope",

            content: `
The cloud-based approach to ${topic} can be applied across multiple industries and organizational environments.

In education, cloud-based intelligent applications can support personalized learning, automated content processing and academic analytics.

In healthcare, cloud infrastructure can support data analysis, intelligent decision support and secure information management when appropriate privacy and regulatory controls are applied.

In banking and financial services, cloud technologies can support analytics, fraud detection, customer services and scalable digital applications.

In e-commerce, intelligent cloud applications can support recommendations, demand analysis, customer behavior analysis and automated services.

In manufacturing, cloud platforms can combine AI, IoT and analytics to support predictive maintenance, process monitoring and operational optimization.

The impact of cloud-based ${topic} can include improved service availability, faster processing, reduced infrastructure management and easier access to advanced computing capabilities.

Future development can focus on more advanced AI models, automated cloud resource management, edge-cloud integration, real-time analytics, improved security and explainable AI.

Serverless architectures may become more widely used for event-driven applications. Containers and orchestration platforms can provide portable deployment environments.

Edge computing can complement cloud computing by processing certain workloads closer to users or devices. This can reduce latency for time-sensitive applications.

Federated and privacy-preserving approaches may become important when sensitive data cannot be centralized easily.

Future systems may also use automated monitoring and intelligent optimization to identify performance problems and dynamically adjust resources.

Therefore, the future scope of ${topic} in cloud computing is broad and can contribute to the development of scalable, intelligent and distributed digital services.
`
        },


        /* =================================================
           SECTION 15
        ================================================= */

        {
            number: 15,

            title: "Conclusion & References",

            content: `
The case study has examined the implementation of ${topic} using a modern cloud computing approach. The analysis demonstrated how cloud infrastructure can address limitations associated with traditional computing environments by providing scalable resources, managed services, flexible deployment and improved operational capabilities.

The proposed architecture combines user access, authentication, application processing, data storage, security and monitoring into an integrated cloud environment. Such an architecture can be adapted according to the requirements of different organizations and application domains.

Security remains an essential part of the proposed solution. Authentication, authorization, encryption, network controls, monitoring and appropriate privacy policies must be considered throughout the application lifecycle.

The study also identified challenges including internet dependency, cost management, security configuration, vendor dependency, privacy requirements and the need for skilled technical resources. These challenges do not eliminate the value of cloud computing but highlight the importance of proper planning and continuous management.

For ${topic}, cloud computing provides a foundation for future innovation. Integration with artificial intelligence, machine learning, analytics, serverless computing, containers and edge technologies can further improve application capabilities.

In conclusion, a carefully designed cloud-based architecture can provide a scalable, flexible and secure environment for ${topic}. The technology can support both academic experimentation and real-world digital applications when appropriate technical, security and operational practices are followed.

References

1. National Institute of Standards and Technology (NIST), The NIST Definition of Cloud Computing.

2. NIST Special Publication 800-145, The NIST Definition of Cloud Computing.

3. NIST Cybersecurity Framework and Cloud Security guidance.

4. Amazon Web Services documentation and cloud architecture guidance.

5. Microsoft Azure cloud computing documentation.

6. Google Cloud documentation and architecture guidance.

7. Cloud computing textbooks and academic research literature related to distributed systems and cloud infrastructure.

8. Research publications related to ${topic}, artificial intelligence and scalable cloud-based systems.
`
        }

    ];
}


/* =========================================================
   ARCHITECTURE GENERATOR
========================================================= */

function createArchitecture(
    topic,
    category
) {

    const topicLower =
        topic.toLowerCase();


    /* =====================================================
       AI
    ===================================================== */

    if (
        category === "ai" ||
        topicLower.includes("artificial intelligence") ||
        topicLower.includes("machine learning") ||
        topicLower.includes("ai on cloud")
    ) {

        return {

            title:
                "Cloud Architecture for Artificial Intelligence on Cloud Computing",

            diagram:
`                    USERS
                       |
                       v
              +----------------+
              | Web / Mobile UI|
              +--------+-------+
                       |
                       v
              +----------------+
              | Authentication |
              |   & API Layer  |
              +--------+-------+
                       |
                       v
              +----------------+
              | Cloud App / API|
              +--------+-------+
                       |
          +------------+-------------+
          |                          |
          v                          v
 +----------------+        +-------------------+
 | AI / ML Service|        | Cloud Database    |
 | Model Inference|        | Structured Data   |
 +--------+-------+        +-------------------+
          |
          v
 +-------------------+
 | Cloud Object      |
 | Storage / Dataset |
 +-------------------+
          |
          v
 +-------------------+
 | Monitoring &      |
 | Security Services |
 +-------------------+`,

            components: [

                {
                    name: "User Interface",
                    description:
                        "Web or mobile interface through which users submit requests and receive results."
                },

                {
                    name: "Authentication",
                    description:
                        "Validates user identity and manages secure access."
                },

                {
                    name: "API Layer",
                    description:
                        "Provides controlled communication between users and cloud services."
                },

                {
                    name: "Cloud Application",
                    description:
                        "Processes requests and coordinates application logic."
                },

                {
                    name: "AI / ML Service",
                    description:
                        "Performs prediction, classification, inference or other intelligent processing."
                },

                {
                    name: "Cloud Database",
                    description:
                        "Stores structured application information and metadata."
                },

                {
                    name: "Cloud Storage",
                    description:
                        "Stores datasets, files, models and other large objects."
                },

                {
                    name: "Security & Monitoring",
                    description:
                        "Provides access control, logging, monitoring and security management."
                }

            ],

            dataFlow:
                "User → Authentication → API → Cloud Application → AI/ML Processing → Database/Storage → Result → User"
        };
    }


    /* =====================================================
       BANKING
    ===================================================== */

    if (
        category === "banking" ||
        topicLower.includes("bank") ||
        topicLower.includes("finance")
    ) {

        return {

            title:
                "Secure Cloud Architecture for Banking and Financial Applications",

            diagram:
`                 CUSTOMER
                    |
                    v
             +-------------+
             | Web / Mobile|
             | Application |
             +------+------+
                    |
                    v
             +-------------+
             | API Gateway |
             +------+------+
                    |
                    v
             +-------------+
             | Application |
             |   Services  |
             +------+------+
                    |
          +---------+---------+
          |                   |
          v                   v
   +-------------+     +-------------+
   | Secure DB   |     | Cloud       |
   | Transactions|     | Analytics   |
   +-------------+     +-------------+
          |
          v
   +-------------+
   | Security /  |
   | IAM / Audit |
   +-------------+`,

            components: [
                {
                    name: "Customer Application",
                    description:
                        "Provides secure access to banking services."
                },
                {
                    name: "API Gateway",
                    description:
                        "Controls and routes customer requests."
                },
                {
                    name: "Application Services",
                    description:
                        "Processes financial transactions and business logic."
                },
                {
                    name: "Secure Database",
                    description:
                        "Stores transaction and customer information."
                },
                {
                    name: "Analytics",
                    description:
                        "Supports reporting, monitoring and intelligent analysis."
                },
                {
                    name: "IAM and Audit",
                    description:
                        "Provides authentication, authorization and audit logging."
                }
            ],

            dataFlow:
                "Customer → Secure Login → API Gateway → Banking Services → Database → Transaction Result"
        };
    }


    /* =====================================================
       EDUCATION
    ===================================================== */

    if (
        category === "education" ||
        topicLower.includes("education") ||
        topicLower.includes("learning") ||
        topicLower.includes("lms")
    ) {

        return {

            title:
                "Cloud Architecture for Education and Learning Applications",

            diagram:
`                 STUDENTS
                    |
                    v
              +-----------+
              | Web / App |
              +-----+-----+
                    |
                    v
              +-----------+
              |   Login   |
              +-----+-----+
                    |
                    v
              +-----------+
              | Cloud LMS |
              +-----+-----+
                    |
          +---------+---------+
          |                   |
          v                   v
   +-------------+     +-------------+
   | Cloud DB    |     | Cloud       |
   | Student Data|     | Content     |
   +-------------+     +-------------+
                    |
                    v
              +-----------+
              | Analytics |
              +-----------+`,

            components: [
                {
                    name: "Student Interface",
                    description:
                        "Allows students to access courses and learning resources."
                },
                {
                    name: "Authentication",
                    description:
                        "Provides secure student and faculty login."
                },
                {
                    name: "Cloud LMS",
                    description:
                        "Runs learning and course management services."
                },
                {
                    name: "Cloud Database",
                    description:
                        "Stores student, course and assessment information."
                },
                {
                    name: "Cloud Content",
                    description:
                        "Stores learning materials and digital resources."
                },
                {
                    name: "Analytics",
                    description:
                        "Provides learning and performance analysis."
                }
            ],

            dataFlow:
                "Student → Login → LMS → Course Service → Database/Content Storage → Learning Result"
        };
    }


    /* =====================================================
       IOT
    ===================================================== */

    if (
        category === "iot" ||
        topicLower.includes("iot") ||
        topicLower.includes("internet of things")
    ) {

        return {

            title:
                "Cloud Architecture for Internet of Things Applications",

            diagram:
`        IoT DEVICES / SENSORS
                  |
                  v
          +---------------+
          | IoT Gateway   |
          +-------+-------+
                  |
                  v
          +---------------+
          | Message       |
          | Broker        |
          +-------+-------+
                  |
                  v
          +---------------+
          | Cloud         |
          | Processing    |
          +-------+-------+
                  |
          +-------+--------+
          |                |
          v                v
    +-----------+    +-----------+
    | Database  |    | Analytics |
    +-----------+    +-----------+
                  |
                  v
           USERS / DASHBOARD`,

            components: [
                {
                    name: "IoT Devices",
                    description:
                        "Collect data from physical environments."
                },
                {
                    name: "IoT Gateway",
                    description:
                        "Collects and forwards device information."
                },
                {
                    name: "Message Broker",
                    description:
                        "Handles communication between devices and cloud services."
                },
                {
                    name: "Cloud Processing",
                    description:
                        "Processes incoming device data."
                },
                {
                    name: "Database",
                    description:
                        "Stores sensor and application data."
                },
                {
                    name: "Analytics",
                    description:
                        "Analyzes data and generates useful insights."
                }
            ],

            dataFlow:
                "Sensors → Gateway → Message Broker → Cloud Processing → Database → Analytics → Dashboard"
        };
    }


    /* =====================================================
       GENERAL CLOUD
    ===================================================== */

    return {

        title:
            `Cloud Architecture for ${topic}`,

        diagram:
`                    USERS
                       |
                       v
              +----------------+
              | Web / Mobile UI|
              +--------+-------+
                       |
                       v
              +----------------+
              | Authentication |
              | & API Gateway  |
              +--------+-------+
                       |
                       v
              +----------------+
              | Cloud          |
              | Application    |
              +--------+-------+
                       |
          +------------+-------------+
          |                          |
          v                          v
 +----------------+        +----------------+
 | Cloud Database |        | Cloud Storage  |
 +----------------+        +----------------+
          |                          |
          +------------+-------------+
                       |
                       v
              +----------------+
              | Security &     |
              | Monitoring     |
              +----------------+`,

        components: [

            {
                name: "User Interface",
                description:
                    "Web or mobile interface for interacting with the cloud application."
            },

            {
                name: "Authentication",
                description:
                    "Controls user identity and secure access."
            },

            {
                name: "API Gateway",
                description:
                    "Routes and controls application requests."
            },

            {
                name: "Cloud Application",
                description:
                    "Contains the main application logic."
            },

            {
                name: "Cloud Database",
                description:
                    "Stores structured application data."
            },

            {
                name: "Cloud Storage",
                description:
                    "Stores files and large objects."
            },

            {
                name: "Security",
                description:
                    "Protects users, services and stored information."
            },

            {
                name: "Monitoring",
                description:
                    "Tracks performance, errors and resource usage."
            }

        ],

        dataFlow:
            "User → Authentication → API Gateway → Cloud Application → Database/Storage → Response → User"
    };
}


/* =========================================================
   CATEGORY NAME
========================================================= */

function getCategoryName(category) {

    const names = {

        general:
            "Cloud Computing",

        ai:
            "Artificial Intelligence & Machine Learning",

        storage:
            "Cloud Storage",

        security:
            "Cloud Security",

        banking:
            "Banking & Financial Services",

        healthcare:
            "Healthcare",

        education:
            "Education",

        ecommerce:
            "E-Commerce",

        iot:
            "Internet of Things",

        serverless:
            "Serverless Computing",

        infrastructure:
            "Cloud Infrastructure"
    };

    return (
        names[category] ||
        "Cloud Computing"
    );
}


/* =========================================================
   APPLY DEPTH
========================================================= */

function applyDepth(
    sections,
    depth
) {

    /*
     * Detailed:
     * Keep all 15 sections.
     */

    if (depth === "detailed") {
        return sections;
    }


    /*
     * Standard:
     * Still retain all academic sections.
     * The report remains professional.
     */

    if (depth === "standard") {

        return sections.map(section => {

            return {
                ...section
            };
        });
    }


    /*
     * Summary:
     * Still retain the complete report structure.
     * We do NOT remove major sections because the
     * application is designed as an academic case study.
     */

    return sections.map(section => ({
        ...section
    }));
}


/* =========================================================
   GENERATION STATE
========================================================= */

function setGeneratingState(
    generating
) {

    if (!generateBtn) {
        return;
    }


    if (generating) {

        generateBtn.disabled = true;

        generateBtn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
            ></span>

            Generating Professional Report...
        `;

        if (generationModal) {
            generationModal.classList.add("show");
        }

    } else {

        generateBtn.disabled = false;

        generateBtn.innerHTML = `
            <i class="bi bi-stars"></i>
            Generate Case Study
        `;

        if (generationModal) {
            generationModal.classList.remove("show");
        }
    }
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

    alert(message);
}


/* =========================================================
   TOPIC SUGGESTIONS
========================================================= */

const topicSuggestions = [

    "Artificial Intelligence on Cloud Computing",

    "Cloud-Based Smart Healthcare System",

    "Cloud Computing in Banking and Finance",

    "Cloud-Based E-Learning Platform",

    "IoT Data Processing Using Cloud Computing",

    "Cloud-Based Cyber Security System",

    "Serverless Computing for Web Applications",

    "Cloud Storage and Data Management",

    "Cloud-Based E-Commerce Platform",

    "Machine Learning as a Cloud Service",

    "Cloud-Based Disaster Recovery System",

    "Cloud Computing for Smart Cities"

];


/* =========================================================
   TOPIC CHIPS
========================================================= */

document
    .querySelectorAll("[data-topic]")
    .forEach((chip) => {

        chip.addEventListener(
            "click",
            () => {

                const topic =
                    chip.dataset.topic;

                if (topicInput) {

                    topicInput.value =
                        topic;

                    topicInput.dispatchEvent(
                        new Event("input")
                    );
                }
            }
        );
    });


/* =========================================================
   INITIAL PREVIEW
========================================================= */

updateArchitecturePreview()
