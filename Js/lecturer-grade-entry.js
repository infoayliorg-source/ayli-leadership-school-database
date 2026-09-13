// ==========================================
// AYLI LECTURER GRADE ENTRY
// ==========================================

const SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// SETTINGS
// ==========================================

let currentLecturer = null;
let assignedCourse = null;
let students = [];


// ==========================================
// ELEMENTS
// ==========================================

const courseName =
    document.getElementById("courseName");

const lecturerName =
    document.getElementById("lecturerName");

const cohortName =
    document.getElementById("cohortName");

const studentCount =
    document.getElementById("studentCount");

const studentsBody =
    document.getElementById("studentsBody");

const studentsTable =
    document.getElementById("studentsTable");

const loadingMessage =
    document.getElementById("loadingMessage");

const saveGradesBtn =
    document.getElementById("saveGradesBtn");

const message =
    document.getElementById("message");


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    initializeGradeEntry
);


async function initializeGradeEntry() {

    try {

        // Check login
        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        const session =
            sessionData.session;


        if (!session || !session.user) {

            window.location.href =
                "lecturer-login.html";

            return;
        }


        // Load lecturer
        await loadLecturer();


        // Load assigned course
        await loadAssignedCourse();


        // Load students
        await loadStudents();


    } catch (error) {

        console.error(
            "Grade Entry Error:",
            error
        );

        showMessage(
            "Unable to load Grade Entry:\n\n" +
            error.message,
            "error"
        );

        loadingMessage.style.display =
            "none";
    }
}


// ==========================================
// LOAD LECTURER
// ==========================================

async function loadLecturer() {

    // Get lecturer ID saved during login
    const lecturerId =
        sessionStorage.getItem("ayliLecturerId");

    if (!lecturerId) {

        throw new Error(
            "Lecturer session not found. Please log in again."
        );
    }

    console.log(
        "Loading lecturer profile:",
        lecturerId
    );

    const {
        data,
        error
    } =
        await supabaseClient
            .from("lecturers")
            .select("*")
            .eq("lecturer_id", lecturerId)
            .maybeSingle();

    if (error) {

        console.error(
            "Lecturer profile error:",
            error
        );

        throw error;
    }

    if (!data) {

        throw new Error(
            "No lecturer profile was found for this lecturer ID."
        );
    }

    if (data.status !== "active") {

        throw new Error(
            "Your lecturer account is inactive."
        );
    }

    currentLecturer = data;

    lecturerName.textContent =
        data.full_name;
}


// ==========================================
// LOAD ASSIGNED COURSE
// ==========================================

async function loadAssignedCourse() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("lecturer_courses")
            .select("*")
            .eq(
                "lecturer_id",
                currentLecturer.id
            )
            .eq(
                "status",
                "active"
            )
            .limit(1)
            .maybeSingle();


    if (error) {
        throw error;
    }


    if (!data) {

        throw new Error(
            "No active course has been assigned to your lecturer account."
        );
    }


    assignedCourse = data;


    courseName.textContent =
        data.course_name;

    cohortName.textContent =
        data.cohort || "All";
}


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    loadingMessage.textContent =
        "Loading Cohort 12 students...";


    let query =
        supabaseClient
            .from("students")
            .select(`
                ayli_id,
                first_name,
                middle_name,
                last_name,
                cohort,
                status
            `);


    // Filter by assigned cohort
    if (assignedCourse.cohort) {

        query = query.eq(
            "cohort",
            assignedCourse.cohort
        );
    }


    const {
        data,
        error
    } = await query.order(
        "ayli_id"
    );


    if (error) {
        throw error;
    }


    students = data || [];


    studentCount.textContent =
        students.length;


    await loadExistingGrades();


    renderStudents();
}


// ==========================================
// LOAD EXISTING GRADES
// ==========================================

let existingGrades = {};


async function loadExistingGrades() {

    existingGrades = {};


    const {
        data,
        error
    } =
        await supabaseClient
            .from("academic_records")
            .select(`
                id,
                ayli_id,
                course,
                lecturer,
                score,
                grade
            `)
            .eq(
                "course",
                assignedCourse.course_name
            );


    if (error) {
        throw error;
    }


    (data || []).forEach(record => {

        existingGrades[
            record.ayli_id
        ] = record;

    });
}


// ==========================================
// RENDER STUDENTS
// ==========================================

function renderStudents() {

    loadingMessage.style.display =
        "none";

    studentsTable.style.display =
        "table";

    saveGradesBtn.style.display =
        "inline-block";


    if (students.length === 0) {

        studentsBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No students were found for this cohort.
                </td>
            </tr>
        `;

        saveGradesBtn.style.display =
            "none";

        return;
    }


    studentsBody.innerHTML =
        students.map(
            (student, index) => {

                const fullName =
                    [
                        student.first_name,
                        student.middle_name,
                        student.last_name
                    ]
                    .filter(Boolean)
                    .join(" ");


                const existing =
                    existingGrades[
                        student.ayli_id
                    ];


                const score =
                    existing &&
                    existing.score !== null
                        ? existing.score
                        : "";


                const grade =
                    existing &&
                    existing.grade
                        ? existing.grade
                        : "—";


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    student.ayli_id
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                fullName
                            )}
                        </td>

                        <td>

                            <input
                                type="number"
                                class="score-input"
                                min="0"
                                max="100"
                                step="0.01"
                                value="${score}"
                                data-ayli-id="${escapeHtml(
                                    student.ayli_id
                                )}"
                                oninput="updateGrade(this)"
                            >

                        </td>

                        <td
                            class="grade"
                            id="grade-${escapeHtml(
                                student.ayli_id
                            )}"
                        >
                            ${escapeHtml(grade)}
                        </td>

                        <td
                            id="status-${escapeHtml(
                                student.ayli_id
                            )}"
                        >
                            ${
                                existing
                                    ? "Saved"
                                    : "Not saved"
                            }
                        </td>

                    </tr>
                `;

            }
        )
        .join("");
}


// ==========================================
// CALCULATE GRADE
// ==========================================

function calculateGrade(score) {

    if (
        score === null ||
        score === "" ||
        isNaN(score)
    ) {
        return "—";
    }


    score = Number(score);


    if (score >= 80) {
        return "A";
    }

    if (score >= 70) {
        return "B";
    }

    if (score >= 60) {
        return "C";
    }

    if (score >= 50) {
        return "D";
    }

    return "F";
}


// ==========================================
// UPDATE GRADE ON SCREEN
// ==========================================

function updateGrade(input) {

    const ayliId =
        input.dataset.ayliId;

    const gradeElement =
        document.getElementById(
            `grade-${ayliId}`
        );


    if (!gradeElement) {
        return;
    }


    const score =
        input.value;


    gradeElement.textContent =
        calculateGrade(score);
}


// ==========================================
// SAVE GRADES
// ==========================================

saveGradesBtn.addEventListener(
    "click",
    saveGrades
);


async function saveGrades() {

    saveGradesBtn.disabled =
        true;

    saveGradesBtn.textContent =
        "Saving Grades...";


    try {

        const inputs =
            document.querySelectorAll(
                ".score-input"
            );


        let savedCount = 0;


        for (const input of inputs) {

            const ayliId =
                input.dataset.ayliId;

            const rawScore =
                input.value.trim();


            // Skip empty scores
            if (rawScore === "") {
                continue;
            }


            const score =
                Number(rawScore);


            // Validate score
            if (
                isNaN(score) ||
                score < 0 ||
                score > 100
            ) {

                throw new Error(
                    `Invalid score for ${ayliId}. Score must be between 0 and 100.`
                );
            }


            const grade =
                calculateGrade(score);


            const student =
                students.find(
                    s =>
                        s.ayli_id === ayliId
                );


            if (!student) {
                continue;
            }


            const existing =
                existingGrades[ayliId];


           if (existing) {

    const result =
        score >= 50
            ? "Pass"
            : "Fail";

    const {
        error
    } =
        await supabaseClient
            .from("academic_records")
            .update({
                score: score,
                grade: grade,
                result: result,
                lecturer:
                    currentLecturer.full_name
            })
            .eq(
                "id",
                existing.id
            );


    if (error) {
        throw error;
    }


}

            // ==================================
            // INSERT NEW RECORD
            // ==================================
  

else {

    const result =
        score >= 50
            ? "Pass"
            : "Fail";

    const { error } =
        await supabaseClient
            .from("academic_records")
            .insert({
                ayli_id:
                    student.ayli_id,

                course:
                    assignedCourse.course_name,

                lecturer:
                    currentLecturer.full_name,

                score:
                    score,

                grade:
                    grade,

                result:
                    result
            });

    if (error) {
        throw error;
    }

}


            savedCount++;
        }


        // Reload grades
        await loadExistingGrades();

        renderStudents();


        showMessage(
            `${savedCount} grade(s) saved successfully.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Save grades error:",
            error
        );


        showMessage(
            "Unable to save grades:\n\n" +
            error.message,
            "error"
        );


    } finally {

        saveGradesBtn.disabled =
            false;

        saveGradesBtn.textContent =
            "Save Grades";
    }
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        "message " + type;

    message.style.display =
        "block";
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(
            /'/g,
            "&#039;"
        );
}