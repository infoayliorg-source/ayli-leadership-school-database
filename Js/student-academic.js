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
        ACADEMIC_SUPABASE_KEY
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
// LOAD ACADEMIC RECORDS
// ==========================================================

async function loadAcademicRecords() {

    try {

        // ----------------------------------------------
        // LOAD STUDENT INFORMATION
        // ----------------------------------------------

        const {
            data: student,
            error: studentError
        } = await academicSupabaseClient
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


        // ----------------------------------------------
        // BUILD STUDENT NAME
        // ----------------------------------------------

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


        // ----------------------------------------------
        // LOAD ACADEMIC RECORDS
        // ----------------------------------------------

        const {
    data: records,
    error: recordsError
} = await academicSupabaseClient
    .from("academic_records")
    .select("*")
    .eq(
        "ayli_id",
        ayliId
    );


        if (recordsError) {

            console.error(
                "Academic records error:",
                recordsError
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


        // ----------------------------------------------
        // DISPLAY RECORDS
        // ----------------------------------------------

        const recordsBody =
            document.getElementById(
                "academicRecordsBody"
            );


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

            return;

        }


        recordsBody.innerHTML =
            records
                .map(
                    record => {

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


        // ----------------------------------------------
        // ACADEMIC STATISTICS
        // ----------------------------------------------

        document.getElementById(
            "totalCourses"
        ).textContent =
            records.length;


        const validScores =
            records
                .map(
                    record =>
                        Number(record.score)
                )
                .filter(
                    score =>
                        !isNaN(score)
                );


        if (
            validScores.length > 0
        ) {

            const totalScore =
                validScores.reduce(
                    (sum, score) =>
                        sum + score,
                    0
                );


            const averageScore =
                totalScore /
                validScores.length;


            document.getElementById(
                "averageScore"
            ).textContent =
                averageScore.toFixed(1);

        }


        // ----------------------------------------------
        // HIGHEST GRADE
        // ----------------------------------------------

        const gradeOrder =
            {
                "A+": 5,
                "A": 4,
                "B+": 3,
                "B": 2,
                "C": 1
            };


        const grades =
            records
                .map(
                    record =>
                        record.grade
                )
                .filter(Boolean);


        if (
            grades.length > 0
        ) {

            const highestGrade =
                grades.reduce(
                    (highest, grade) => {

                        if (
                            gradeOrder[grade] >
                            gradeOrder[highest]
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

        }


    } catch (error) {

        console.error(
            "Academic page error:",
            error
        );

    }

}


// ==========================================================
// START
// ==========================================================

loadAcademicRecords();