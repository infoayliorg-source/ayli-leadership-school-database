// ==========================================================
// AYLI STUDENT DASHBOARD
// ==========================================================


// ==========================================================
// SUPABASE CONFIGURATION
// ==========================================================

const DASHBOARD_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const DASHBOARD_SUPABASE_ANON_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


const dashboardSupabaseClient =
    supabase.createClient(
        DASHBOARD_SUPABASE_URL,
        DASHBOARD_SUPABASE_ANON_KEY
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
// LOAD STUDENT DASHBOARD
// ==========================================================

async function loadStudentDashboard() {

    try {

        // ==================================================
        // LOAD STUDENT INFORMATION
        // ==================================================

        const {
            data: student,
            error: studentError
        } = await dashboardSupabaseClient
            .from("students")
            .select("*")
            .eq("ayli_id", ayliId)
            .single();


        if (
            studentError ||
            !student
        ) {

            console.error(
                "Dashboard student loading error:",
                studentError
            );

            document.getElementById(
                "welcomeMessage"
            ).textContent =
                "Student not found";

            return;

        }


        // ==================================================
        // BUILD STUDENT NAME
        // ==================================================

        const fullName =
            [

                student.first_name ||
                student.firstName,

                student.middle_name ||
                student.middleName,

                student.last_name ||
                student.lastName

            ]
            .filter(Boolean)
            .join(" ");


        // ==================================================
        // DISPLAY STUDENT INFORMATION
        // ==================================================

        document.getElementById(
            "welcomeMessage"
        ).textContent =
            "Welcome, " +
            (fullName || "Student") +
            " 👋";


        document.getElementById(
            "studentDetails"
        ).textContent =
            "AYLI ID: " +
            (student.ayli_id || "-") +
            " | Cohort: " +
            (student.cohort || "-") +
            " | Chapter: " +
            (student.chapter || "-");


        // ==================================================
        // LOAD GRADUATION CLEARANCE
        // ==================================================

        const studentPassword =
            localStorage.getItem(
                "ayliStudentPassword"
            );


        let clearance = null;


        if (studentPassword) {

            const {
                data: clearanceData,
                error: clearanceError
            } = await dashboardSupabaseClient
                .rpc(
                    "get_student_graduation_clearance",
                    {
                        p_ayli_id: ayliId,
                        p_password: studentPassword
                    }
                );


            if (clearanceError) {

                console.error(
                    "Graduation clearance error:",
                    clearanceError
                );

            } else if (
                clearanceData &&
                clearanceData.length > 0
            ) {

                clearance =
                    clearanceData[0];

            }

        }


        // ==================================================
        // CREATE DASHBOARD CLEARANCE SUMMARY
        // ==================================================

        let clearanceCard =
            document.getElementById(
                "dashboardGraduationStatus"
            );


        if (!clearanceCard) {

            clearanceCard =
                document.createElement("div");

            clearanceCard.id =
                "dashboardGraduationStatus";

            const dashboardMenu =
                document.querySelector(
                    ".student-dashboard-menu"
                );


            if (dashboardMenu) {

                dashboardMenu.parentNode.insertBefore(
                    clearanceCard,
                    dashboardMenu
                );

            }

        }


        // ==================================================
        // DISPLAY CLEARANCE
        // ==================================================

        if (!clearance) {

            clearanceCard.innerHTML = `
                <div class="dashboard-clearance pending">

                    <div class="clearance-icon">
                        🎓
                    </div>

                    <div class="clearance-text">

                        <h3>
                            Graduation Status
                        </h3>

                        <strong>
                            Clearance in progress
                        </strong>

                        <p>
                            Your graduation clearance has not
                            yet been published.
                        </p>

                    </div>

                    <a
                        href="student-graduation-clearance.html"
                        class="clearance-button"
                    >
                        View Clearance
                    </a>

                </div>
            `;

        } else {

            const finalStatus =
                String(
                    clearance.final_status || ""
                )
                .trim()
                .toLowerCase();


            const isCleared =
                finalStatus === "cleared" ||
                finalStatus === "final cleared" ||
                finalStatus === "approved";


            if (isCleared) {

                clearanceCard.innerHTML = `
                    <div class="dashboard-clearance cleared">

                        <div class="clearance-icon">
                            🎓
                        </div>

                        <div class="clearance-text">

                            <h3>
                                Graduation Status
                            </h3>

                            <strong>
                                CLEARED FOR GRADUATION ✅
                            </strong>

                            <p>
                                You have successfully completed
                                the required graduation requirements.
                            </p>

                            ${
                                clearance.graduation_date
                                    ? `
                                        <p>
                                            <strong>
                                                Graduation:
                                            </strong>
                                            ${clearance.graduation_date}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>

                        <a
                            href="student-graduation-clearance.html"
                            class="clearance-button"
                        >
                            View Clearance
                        </a>

                    </div>
                `;

            } else {

                clearanceCard.innerHTML = `
                    <div class="dashboard-clearance pending">

                        <div class="clearance-icon">
                            🎓
                        </div>

                        <div class="clearance-text">

                            <h3>
                                Graduation Status
                            </h3>

                            <strong>
                                ${
                                    clearance.final_status ||
                                    "CLEARANCE IN PROGRESS"
                                }
                            </strong>

                            <p>
                                Your graduation clearance is
                                currently being processed.
                            </p>

                        </div>

                        <a
                            href="student-graduation-clearance.html"
                            class="clearance-button"
                        >
                            View Clearance
                        </a>

                    </div>
                `;

            }

        }


    } catch (error) {

        console.error(
            "Student dashboard error:",
            error
        );

        document.getElementById(
            "welcomeMessage"
        ).textContent =
            "Unable to load dashboard";

    }

}


// ==========================================================
// START DASHBOARD
// ==========================================================

loadStudentDashboard();


// ==========================================================
// STUDENT LOGOUT
// ==========================================================

function studentLogout() {

    localStorage.removeItem(
        "ayliStudentLoggedIn"
    );

    localStorage.removeItem(
        "ayliCurrentStudentId"
    );

    localStorage.removeItem(
        "ayliStudentPassword"
    );


    window.location.href =
        "student-login.html";

}