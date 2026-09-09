// ==========================================================
// AYLI STUDENT CERTIFICATES
// ==========================================================


// ==========================================================
// SUPABASE CONNECTION
// ==========================================================

const CERTIFICATE_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";


const CERTIFICATE_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


const certificateSupabaseClient =
    supabase.createClient(
        CERTIFICATE_SUPABASE_URL,
        CERTIFICATE_SUPABASE_KEY
    );


// ==========================================================
// CHECK STUDENT LOGIN
// ==========================================================

const studentLoggedIn =
    localStorage.getItem(
        "ayliStudentLoggedIn"
    );


const ayliId =
    localStorage.getItem(
        "ayliCurrentStudentId"
    );


if (
    studentLoggedIn !== "true" ||
    !ayliId
) {

    window.location.href =
        "student-login.html";

}


// ==========================================================
// LOAD STUDENT CERTIFICATES
// ==========================================================

async function loadStudentCertificates() {

    try {

        // --------------------------------------------------
        // LOAD STUDENT INFORMATION
        // --------------------------------------------------

        const {
            data: student,
            error: studentError
        } = await certificateSupabaseClient
            .from("students")
            .select("*")
            .eq(
                "ayli_id",
                ayliId
            )
            .single();


        if (
            studentError ||
            !student
        ) {

            console.error(
                "Student loading error:",
                studentError
            );

            document.getElementById(
                "studentCertificateName"
            ).textContent =
                "Student not found";

            return;

        }


        // --------------------------------------------------
        // BUILD STUDENT NAME
        // --------------------------------------------------

        const fullName =
            [
                student.first_name,
                student.middle_name,
                student.last_name
            ]
            .filter(Boolean)
            .join(" ");


        document.getElementById(
            "studentCertificateName"
        ).textContent =
            fullName ||
            "My Certificates";


        // --------------------------------------------------
        // LOAD CERTIFICATES
        // --------------------------------------------------

        const {
            data: certificates,
            error: certificatesError
        } = await certificateSupabaseClient
            .from("certificates")
            .select("*")
            .eq(
                "ayli_id",
                ayliId
            )
            .order(
                "issue_date",
                {
                    ascending: false
                }
            );


        const recordsBody =
            document.getElementById(
                "certificateRecordsBody"
            );


        if (certificatesError) {

            console.error(
                "Certificate loading error:",
                certificatesError
            );

            recordsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load certificates.
                    </td>
                </tr>
            `;

            return;

        }


        // --------------------------------------------------
        // NO CERTIFICATES
        // --------------------------------------------------

        if (
            !certificates ||
            certificates.length === 0
        ) {

            recordsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No certificates found.
                    </td>
                </tr>
            `;


            document.getElementById(
                "totalCertificates"
            ).textContent =
                "0";


            document.getElementById(
                "latestCertificate"
            ).textContent =
                "-";

            return;

        }


        // --------------------------------------------------
        // DISPLAY CERTIFICATES
        // --------------------------------------------------

        recordsBody.innerHTML =
            certificates
                .map(
                    certificate => {

                        const formattedDate =
                            certificate.issue_date
                                ? new Date(
                                    certificate.issue_date
                                ).toLocaleDateString()
                                : "-";


                        const certificateStatus =
    (certificate.status || "")
    .trim()
    .toLowerCase();


const certificateAction =
    certificateStatus === "issued"
        ? `
            <a
                href="certificate-view.html?certificate=${encodeURIComponent(
                    certificate.certificate_number
                )}"
                class="view-certificate-button"
            >
                📜 View Certificate
            </a>
        `
        : `
            <span class="certificate-pending">
                ⏳ Pending
            </span>
        `;


return `
    <tr>

        <td>
            ${certificate.type || "-"}
        </td>

        <td>
            ${certificate.certificate_number || "-"}
        </td>

        <td>
            ${formattedDate}
        </td>

        <td>
            ${certificate.status || "-"}
        </td>

        <td>
            ${certificateAction}
        </td>

    </tr>
`;

                    }
                )
                .join("");


        // --------------------------------------------------
        // TOTAL CERTIFICATES
        // --------------------------------------------------

        document.getElementById(
            "totalCertificates"
        ).textContent =
            certificates.length;


        // --------------------------------------------------
        // LATEST CERTIFICATE
        // --------------------------------------------------

        document.getElementById(
            "latestCertificate"
        ).textContent =
            certificates[0].type ||
            "-";


    } catch (error) {

        console.error(
            "Student certificates page error:",
            error
        );

        document.getElementById(
            "certificateRecordsBody"
        ).innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load certificates.
                </td>
            </tr>
        `;

    }

}


// ==========================================================
// START
// ==========================================================

loadStudentCertificates();