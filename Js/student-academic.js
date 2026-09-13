// ==========================================================
// AYLI STUDENT ACADEMIC RECORDS
// ==========================================================


// ==========================================================
// SUPABASE CONNECTION
// ==========================================================

const ACADEMIC_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const ACADEMIC_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";

const academicSupabaseClient =
    supabase.createClient(
        ACADEMIC_SUPABASE_URL,
        ACADEMIC_SUPABASE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );

// ==========================================================
// CHECK STUDENT LOGIN
// ==========================================================

const studentLoggedIn =
    localStorage.getItem("ayliStudentLoggedIn");

const ayliId =
    localStorage.getItem("ayliCurrentStudentId");


if (
    studentLoggedIn !== "true" ||
    !ayliId
) {
    window.location.href =
        "student-login.html";
}


// ==========================================================
// LOAD ACADEMIC RECORDS
// ==========================================================

async function loadAcademicRecords() {

    try {

        console.log(
            "Loading academic records for:",
            ayliId
        );


        // ==================================================
        // LOAD STUDENT INFORMATION
        // ==================================================

        const {
            data: student,
            error: studentError
        } =
            await academicSupabaseClient
                .from("students")
                .select("*")
                .eq("ayli_id", ayliId)
                .single();


        if (studentError || !student) {

            console.error(
                "Student loading error:",
                studentError
            );

            document.getElementById(
                "studentAcademicName"
            ).textContent =
                "Student not found";

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


        document.getElementById(
            "studentAcademicName"
        ).textContent =
            fullName ||
            "Academic Records";


        // ==================================================
        // LOAD ALL ACADEMIC RECORDS
        // ==================================================

        const {
            data: records,
            error: recordsError
        } =
            await academicSupabaseClient
                .from("academic_records")
                .select(
                    "id, ayli_id, course, lecturer, score, grade, result"
                )
                .eq(
                    "ayli_id",
                    ayliId
                )
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        // ==================================================
        // HANDLE DATABASE ERROR
        // ==================================================

        if (recordsError) {

            console.error(
                "Academic records error:",
                recordsError
            );

            alert(
                "Academic Records Error:\n\n" +
                recordsError.message
            );

            document.getElementById(
                "academicRecordsBody"
            ).innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load academic records.
                    </td>
                </tr>
            `;

            return;
        }


        console.log(
            "Academic records returned:",
            records
        );

        console.log(
            "Number of academic records:",
            records ? records.length : 0
        );


        // ==================================================
        // GET TABLE
        // ==================================================

        const recordsBody =
            document.getElementById(
                "academicRecordsBody"
            );


        // ==================================================
        // NO RECORDS
        // ==================================================

        if (
            !records ||
            records.length === 0
        ) {

            recordsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No academic records found.
                    </td>
                </tr>
            `;


            document.getElementById(
                "totalCourses"
            ).textContent =
                "0";


            document.getElementById(
                "averageScore"
            ).textContent =
                "-";


            document.getElementById(
                "highestGrade"
            ).textContent =
                "-";


            return;
        }


        // ==================================================
        // DISPLAY ALL RECORDS
        // ==================================================

        recordsBody.innerHTML =
            records
                .map(
                    function(record) {

                        return `
                            <tr>

                                <td>
                                    ${record.course || "-"}
                                </td>

                                <td>
                                    ${record.lecturer || "-"}
                                </td>

                                <td>
                                    ${record.score ?? "-"}
                                </td>

                                <td>
                                    ${record.grade || "-"}
                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


        // ==================================================
        // TOTAL COURSES
        // ==================================================

        document.getElementById(
            "totalCourses"
        ).textContent =
            records.length;


        // ==================================================
        // CALCULATE AVERAGE SCORE
        // ==================================================

        const validScores =
            records
                .map(
                    function(record) {
                        return Number(record.score);
                    }
                )
                .filter(
                    function(score) {
                        return !isNaN(score);
                    }
                );


        if (
            validScores.length > 0
        ) {

            const totalScore =
                validScores.reduce(
                    function(sum, score) {
                        return sum + score;
                    },
                    0
                );


            const averageScore =
                totalScore /
                validScores.length;


            document.getElementById(
                "averageScore"
            ).textContent =
                averageScore.toFixed(1);

        } else {

            document.getElementById(
                "averageScore"
            ).textContent =
                "-";
        }


        // ==================================================
        // FIND HIGHEST GRADE
        // ==================================================

        const gradeOrder =
            {
                "A+": 6,
                "A": 5,
                "B+": 4,
                "B": 3,
                "C+": 2,
                "C": 1,
                "D": 0,
                "F": -1
            };


        const grades =
            records
                .map(
                    function(record) {
                        return record.grade;
                    }
                )
                .filter(Boolean);


        if (
            grades.length > 0
        ) {

            const highestGrade =
                grades.reduce(
                    function(highest, grade) {

                        const currentValue =
                            gradeOrder[grade] ??
                            -999;

                        const highestValue =
                            gradeOrder[highest] ??
                            -999;


                        if (
                            currentValue >
                            highestValue
                        ) {
                            return grade;
                        }


                        return highest;

                    }
                );


            document.getElementById(
                "highestGrade"
            ).textContent =
                highestGrade;

        } else {

            document.getElementById(
                "highestGrade"
            ).textContent =
                "-";
        }


        // ==================================================
        // FINISHED
        // ==================================================

        console.log(
            "All academic records displayed successfully."
        );

    }

    catch (error) {

        console.error(
            "Academic page error:",
            error
        );

        alert(
            "Unable to load Academic Records.\n\n" +
            error.message
        );
    }
}


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadAcademicRecords();

    }
);