// ==========================================
// AYLI LECTURER AUTHENTICATION
// ==========================================

const SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";

const lecturerSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// ELEMENTS
// ==========================================

const loginForm =
    document.getElementById("lecturerLoginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const message =
    document.getElementById("message");

const togglePassword =
    document.getElementById("togglePassword");


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, type = "error") {

    message.textContent = text;

    message.className =
        "message " + type;

    message.style.display = "block";
}


// ==========================================
// PASSWORD VISIBILITY
// ==========================================

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent = "Hide";

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "Show";
        }

    });

}


// ==========================================
// LECTURER LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showMessage(
            "Please enter your email and password."
        );

        return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent = "Signing in...";

    message.style.display = "none";


    try {

        // ------------------------------------------
        // SIGN IN WITH SUPABASE AUTHENTICATION
        // ------------------------------------------

        const { data, error } =
            await lecturerSupabase.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(
                "Lecturer login error:",
                error
            );

            showMessage(
                error.message ||
                "Invalid lecturer email or password."
            );

            return;
        }


        if (!data.user) {

            showMessage(
                "Unable to verify lecturer account."
            );

            return;
        }


        // ------------------------------------------
        // FIND LECTURER PROFILE
        // ------------------------------------------

        const { data: lecturer, error: lecturerError } =
            await lecturerSupabase
                .from("lecturers")
                .select("*")
                .eq("email", email)
                .maybeSingle();


        if (lecturerError) {

            console.error(
                "Lecturer profile error:",
                lecturerError
            );

            await lecturerSupabase.auth.signOut();

            showMessage(
                "Unable to load your lecturer profile."
            );

            return;
        }


        if (!lecturer) {

            await lecturerSupabase.auth.signOut();

            showMessage(
                "Your account is authenticated, but no lecturer profile was found."
            );

            return;
        }


        // ------------------------------------------
        // CHECK ACCOUNT STATUS
        // ------------------------------------------

        if (lecturer.status !== "active") {

            await lecturerSupabase.auth.signOut();

            showMessage(
                "Your lecturer account is currently inactive."
            );

            return;
        }


        // ------------------------------------------
        // SAVE BASIC SESSION INFORMATION
        // ------------------------------------------

        sessionStorage.setItem(
            "ayliLecturerId",
            lecturer.lecturer_id
        );

        sessionStorage.setItem(
            "ayliLecturerName",
            lecturer.full_name
        );

        sessionStorage.setItem(
            "ayliLecturerEmail",
            lecturer.email
        );


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        showMessage(
            "Login successful. Opening Lecturer Portal...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "lecturer-dashboard.html";

        }, 700);


    } catch (error) {

        console.error(
            "Unexpected lecturer login error:",
            error
        );

        showMessage(
            "An unexpected error occurred. Please try again."
        );

    } finally {

        loginBtn.disabled = false;

        loginBtn.textContent = "Login";
    }

});