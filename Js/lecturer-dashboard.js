// ==========================================
// AYLI LECTURER DASHBOARD
// ==========================================

const SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";

const lecturerDashboardSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// ELEMENTS
// ==========================================

const lecturerName =
    document.getElementById("lecturerName");

const lecturerId =
    document.getElementById("lecturerId");

const lecturerStatus =
    document.getElementById("lecturerStatus");

const courseCount =
    document.getElementById("courseCount");

const coursesContainer =
    document.getElementById("coursesContainer");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// CHECK LECTURER SESSION
// ==========================================

async function checkLecturerSession() {

    try {

        const { data, error } =
            await lecturerDashboardSupabase.auth.getSession();

        if (error) {

            console.error(
                "Session error:",
                error
            );

            redirectToLogin();

            return;
        }

        const session = data.session;

        if (!session || !session.user) {

            redirectToLogin();

            return;
        }


        // ======================================
        // GET AUTHENTICATED EMAIL
        // ======================================

        const userEmail =
            session.user.email;


        // ======================================
        // LOAD LECTURER PROFILE
        // ======================================

        const { data: lecturer, error: lecturerError } =
            await lecturerDashboardSupabase
                .from("lecturers")
                .select("*")
                .eq("email", userEmail)
                .maybeSingle();


        if (lecturerError) {

            console.error(
                "Lecturer profile error:",
                lecturerError
            );

            alert(
                "Unable to load lecturer profile:\n\n" +
                lecturerError.message
            );

            await lecturerDashboardSupabase.auth.signOut();

            redirectToLogin();

            return;
        }


        if (!lecturer) {

            alert(
                "No lecturer profile is associated with this account."
            );

            await lecturerDashboardSupabase.auth.signOut();

            redirectToLogin();

            return;
        }


        // ======================================
        // CHECK ACCOUNT STATUS
        // ======================================

        if (lecturer.status !== "active") {

            alert(
                "Your lecturer account is inactive."
            );

            await lecturerDashboardSupabase.auth.signOut();

            redirectToLogin();

            return;
        }


        // ======================================
        // DISPLAY LECTURER INFORMATION
        // ======================================

        lecturerName.textContent =
            lecturer.full_name;

        lecturerId.textContent =
            lecturer.lecturer_id;

        lecturerStatus.textContent =
            lecturer.status
                .charAt(0)
                .toUpperCase() +
            lecturer.status.slice(1);


        // ======================================
        // LOAD ASSIGNED COURSES
        // ======================================

        await loadLecturerCourses(
            lecturer.id
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        redirectToLogin();
    }
}


// ==========================================
// LOAD LECTURER COURSES
// ==========================================

async function loadLecturerCourses(
    lecturerDatabaseId
) {

    coursesContainer.innerHTML = `
        <div class="loading">
            Loading your courses...
        </div>
    `;


    const {
        data: courses,
        error
    } =
        await lecturerDashboardSupabase
            .from("lecturer_courses")
            .select(`
                id,
                course_name,
                cohort,
                chapter,
                status
            `)
            .eq(
                "lecturer_id",
                lecturerDatabaseId
            )
            .eq(
                "status",
                "active"
            )
            .order(
                "course_name"
            );


    if (error) {

        console.error(
            "Course assignment error:",
            error
        );

        coursesContainer.innerHTML = `
            <div class="empty">
                Unable to load assigned courses.
                <br><br>
                ${error.message}
            </div>
        `;

        courseCount.textContent = "0";

        return;
    }


    if (!courses || courses.length === 0) {

        coursesContainer.innerHTML = `
            <div class="empty">
                No courses have been assigned yet.
            </div>
        `;

        courseCount.textContent = "0";

        return;
    }


    // ======================================
    // UPDATE COURSE COUNT
    // ======================================

    courseCount.textContent =
        courses.length;


    // ======================================
    // DISPLAY COURSES
    // ======================================

    coursesContainer.innerHTML =
        courses.map(course => {

            return `
                <div class="course-box">

                    <h4>
                        ${escapeHtml(
                            course.course_name
                        )}
                    </h4>

                    <p>
                        <strong>Cohort:</strong>
                        ${escapeHtml(
                            course.cohort || "—"
                        )}
                    </p>

                    ${
                        course.chapter
                            ? `
                                <p>
                                    <strong>Chapter:</strong>
                                    ${escapeHtml(
                                        course.chapter
                                    )}
                                </p>
                              `
                            : ""
                    }

                    <p>
                        <strong>Status:</strong>
                        Active
                    </p>

                </div>
            `;

        })
        .join("");
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        logoutBtn.disabled = true;

        logoutBtn.textContent =
            "Logging out...";


        const { error } =
            await lecturerDashboardSupabase
                .auth
                .signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            logoutBtn.disabled = false;

            logoutBtn.textContent =
                "Logout";

            alert(
                "Unable to log out:\n\n" +
                error.message
            );

            return;
        }


        sessionStorage.removeItem(
            "ayliLecturerId"
        );

        sessionStorage.removeItem(
            "ayliLecturerName"
        );

        sessionStorage.removeItem(
            "ayliLecturerEmail"
        );


        redirectToLogin();
    }
);


// ==========================================
// REDIRECT TO LOGIN
// ==========================================

function redirectToLogin() {

    window.location.href =
        "lecturer-login.html";
}


// ==========================================
// START DASHBOARD
// ==========================================

checkLecturerSession();