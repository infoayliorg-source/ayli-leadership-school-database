// ==========================================================
// AYLI STUDENT AUTHENTICATION
// ==========================================================


// SUPABASE CONNECTION

const STUDENT_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";


const STUDENT_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


const studentSupabaseClient =
    supabase.createClient(
        STUDENT_SUPABASE_URL,
        STUDENT_SUPABASE_KEY
    );


// ==========================================================
// STUDENT LOGIN
// ==========================================================

document
    .getElementById("studentLoginForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const ayliId =
                document
                    .getElementById("ayliId")
                    .value
                    .trim()
                    .toUpperCase();


            const password =
                document
                    .getElementById("studentPassword")
                    .value;


            const message =
                document.getElementById(
                    "studentLoginMessage"
                );


            message.textContent =
                "Logging in...";


            message.style.color =
                "black";


            // ==================================================
            // GET STUDENT FROM SUPABASE
            // ==================================================

            const {
                data: student,
                error
            } = await studentSupabaseClient
                .from("students")
                .select("*")
                .eq("ayli_id", ayliId)
                .single();


            // ==================================================
            // HANDLE ERRORS
            // ==================================================

            if (error || !student) {

                console.error(
                    "Student login error:",
                    error
                );


                message.textContent =
                    "Invalid AYLI ID or password.";


                message.style.color =
                    "red";


                return;

            }


            // ==================================================
            // CHECK PASSWORD
            // ==================================================

            if (password !== student.password_hash) {

    message.textContent =
        "Invalid AYLI ID or password.";

    message.style.color =
        "red";

    return;

}


            // ==================================================
            // SAVE STUDENT LOGIN SESSION
            // ==================================================

            localStorage.setItem(
                "ayliStudentLoggedIn",
                "true"
            );


            localStorage.setItem(
                "ayliCurrentStudentId",
                student.ayli_id
            );


            // ==================================================
            // REDIRECT TO STUDENT PROFILE
            // ==================================================

            window.location.href =
    "student-dashboard.html";

        }
    );