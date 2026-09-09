// ==========================================================
// AYLI STUDENT DASHBOARD
// ==========================================================


// ==========================================================
// SUPABASE CONFIGURATION
// ==========================================================

// Use the same Supabase configuration already used
// in your student-profile.html or other working JS file.

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

        const {
            data: student,
            error
        } = await dashboardSupabaseClient
            .from("students")
            .select("*")
            .eq("ayli_id", ayliId)
            .single();


        if (error || !student) {

            console.error(
                "Dashboard student loading error:",
                error
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


    window.location.href =
        "student-login.html";

}