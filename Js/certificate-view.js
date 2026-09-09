console.log("CERTIFICATE VIEW JS HAS LOADED");
// ==========================================================
// AYLI CERTIFICATE VIEWER
// ==========================================================


// ==========================================================
// SUPABASE CONNECTION
// ==========================================================

const CERTIFICATE_VIEW_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";


const CERTIFICATE_VIEW_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


const certificateViewSupabase =
    supabase.createClient(
        CERTIFICATE_VIEW_SUPABASE_URL,
        CERTIFICATE_VIEW_SUPABASE_KEY
    );


// ==========================================================
// CHECK STUDENT LOGIN
// ==========================================================

const studentLoggedIn =
    localStorage.getItem(
        "ayliStudentLoggedIn"
    );


const currentStudentAyliId =
    localStorage.getItem(
        "ayliCurrentStudentId"
    );


if (
    studentLoggedIn !== "true" ||
    !currentStudentAyliId
) {

    window.location.href =
        "student-login.html";

}


// ==========================================================
// GET CERTIFICATE NUMBER FROM URL
// ==========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const certificateNumber =
    urlParams.get(
        "certificate"
    );
console.log(
    "Certificate Number:",
    certificateNumber
);

console.log(
    "Current Student AYLI ID:",
    currentStudentAyliId
);

// ==========================================================
// LOAD CERTIFICATE
// ==========================================================

async function loadCertificate() {

    try {

        // ==================================================
        // CHECK CERTIFICATE NUMBER
        // ==================================================

        if (!certificateNumber) {

            alert(
                "Certificate not found. No certificate number was provided."
            );

            window.location.href =
                "student-certificates.html";

            return;

        }


        // ==================================================
        // LOAD CERTIFICATE
        // ==================================================

        const {
            data: certificate,
            error
        } = await certificateViewSupabase
            .from("certificates")
            .select("*")
            .eq(
                "certificate_number",
                certificateNumber
            )
            .eq(
                "ayli_id",
                currentStudentAyliId
            )
            .single();

console.log(
    "Certificate returned from Supabase:",
    certificate
);

console.log(
    "Certificate query error:",
    error
);
        if (
            error ||
            !certificate
        ) {

            console.error(
                "Certificate loading error:",
                error
            );

            alert(
                "Certificate not found or does not belong to your account."
            );

            window.location.href =
                "student-certificates.html";

            return;

        }


        // ==================================================
// CHECK CERTIFICATE STATUS
// ==================================================

const certificateStatus =
    String(
        certificate.status || ""
    )
    .trim()
    .toLowerCase();


console.log(
    "Certificate Status:",
    certificateStatus
);


if (
    certificateStatus !==
    "issued"
) {

    alert(
        "This certificate is still pending and cannot be viewed yet."
    );

    window.location.href =
        "student-certificates.html";

    return;

}


        // ==================================================
// LOAD STUDENT INFORMATION
// ==================================================

const {
    data: student,
    error: studentError
} = await certificateViewSupabase
    .from("students")
    .select("*")
    .eq(
        "ayli_id",
        currentStudentAyliId
    )
    .single();


console.log(
    "Student returned from Supabase:",
    student
);

console.log(
    "Student query error:",
    studentError
);


if (
    studentError ||
    !student
) {

    console.error(
        "Student loading error:",
        studentError
    );

    alert(
        "Unable to load student information."
    );

    return;

}
        // ==================================================
        // BUILD STUDENT NAME
        // ==================================================

        const fullName =
            [
                student.first_name,
                student.middle_name,
                student.last_name
            ]
            .filter(Boolean)
            .join(" ");


        // ==================================================
        // FORMAT ISSUE DATE
        // ==================================================

        const formattedDate =
            certificate.issue_date
                ? new Date(
                    certificate.issue_date
                ).toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                )
                : "-";


        // ==================================================
// FILL PROFESSIONAL CERTIFICATE
// ==================================================

console.log(
    "FILLING PROFESSIONAL CERTIFICATE NOW"
);

console.log(
    "Student full name:",
    fullName
);


const certificateTypeElement =
    document.getElementById(
        "previewCertificateType"
    );

const studentNameElement =
    document.getElementById(
        "previewStudentName"
    );

const ayliIdElement =
    document.getElementById(
        "previewAyliId"
    );

const certificateNumberElement =
    document.getElementById(
        "previewCertificateNumber"
    );

const issueDateElement =
    document.getElementById(
        "previewIssueDate"
    );


console.log(
    "Certificate Type Element:",
    certificateTypeElement
);

console.log(
    "Student Name Element:",
    studentNameElement
);

console.log(
    "AYLI ID Element:",
    ayliIdElement
);

console.log(
    "Certificate Number Element:",
    certificateNumberElement
);

console.log(
    "Issue Date Element:",
    issueDateElement
);


if (
    certificateTypeElement &&
    studentNameElement &&
    ayliIdElement &&
    certificateNumberElement &&
    issueDateElement
) {

    certificateTypeElement.textContent =
        certificate.type ||
        "CERTIFICATE OF COMPLETION";


    studentNameElement.textContent =
        fullName ||
        "Student Name";


    ayliIdElement.textContent =
        certificate.ayli_id ||
        "-";


    certificateNumberElement.textContent =
        certificate.certificate_number ||
        "-";


    issueDateElement.textContent =
        formattedDate;


    console.log(
        "CERTIFICATE PAGE UPDATED SUCCESSFULLY"
    );

} else {

    console.error(
        "One or more certificate HTML elements were not found."
    );

}


} catch (error) {

    console.error(
        "Certificate viewer error:",
        error
    );

    alert(
        "Unable to load certificate. Please try again."
    );

}

}

// ==========================================================
// START CERTIFICATE VIEWER
// ==========================================================

loadCertificate();