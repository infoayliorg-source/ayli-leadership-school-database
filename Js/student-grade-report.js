// ==========================================
// AYLI STUDENT GRADE REPORT
// ==========================================

const REPORT_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const REPORT_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


// ==========================================
// SUPABASE CLIENT
// IMPORTANT:
// Do NOT reuse lecturer/student auth sessions
// on the public student grade report.
// ==========================================

const reportSupabaseClient =
    window.supabase.createClient(
        REPORT_SUPABASE_URL,
        REPORT_SUPABASE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );


// ==========================================
// LOAD GRADE REPORT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const studentLoggedIn =
            localStorage.getItem(
                "ayliStudentLoggedIn"
            );

        const ayliId =
            localStorage.getItem(
                "ayliCurrentStudentId"
            );


        // ==========================================
        // MAKE SURE STUDENT IS LOGGED IN
        // ==========================================

        if (!studentLoggedIn || !ayliId) {

            window.location.href =
                "student-login.html";

            return;
        }


        try {

            // ==========================================
            // GET STUDENT INFORMATION
            // ==========================================

            const {
                data: student,
                error: studentError
            } =
                await reportSupabaseClient
                    .from("students")
                    .select("*")
                    .eq("ayli_id", ayliId)
                    .single();


            if (studentError) {

                console.error(
                    "Student loading error:",
                    studentError
                );

                alert(
                    "Unable to load student information.\n\n" +
                    studentError.message
                );

                return;
            }


            if (!student) {

                alert(
                    "Student information was not found."
                );

                return;
            }


            // ==========================================
            // DISPLAY STUDENT INFORMATION
            // ==========================================

            const fullName = [

                student.first_name,

                student.middle_name,

                student.last_name

            ]
                .filter(name =>
                    name &&
                    name.trim() !== "" &&
                    name.toUpperCase() !== "EMPTY"
                )
                .join(" ");


            document.getElementById(
                "studentName"
            ).textContent =
                fullName || "-";


            document.getElementById(
                "studentId"
            ).textContent =
                student.ayli_id || "-";


            document.getElementById(
                "studentCohort"
            ).textContent =
                student.cohort || "-";


            document.getElementById(
                "studentChapter"
            ).textContent =
                student.chapter || "-";


            // ==========================================
            // GET ACADEMIC RECORDS
            // ==========================================

            const {
                data: records,
                error: recordsError
            } =
                await reportSupabaseClient
                    .from("academic_records")
                    .select("*")
                    .eq("ayli_id", ayliId)
                    .order("id", {
                        ascending: true
                    });


            if (recordsError) {

                console.error(
                    "Academic records error:",
                    recordsError
                );


                document.getElementById(
                    "gradeReportBody"
                ).innerHTML = `
                    <tr>
                        <td colspan="6"
                            style="text-align:center;">
                            Unable to load academic records.
                        </td>
                    </tr>
                `;


                document.getElementById(
                    "overallStatus"
                ).textContent =
                    "Unable to Load";


                return;
            }


            // ==========================================
            // CHECK RECORDS
            // ==========================================

            if (
                !records ||
                records.length === 0
            ) {

                document.getElementById(
                    "gradeReportBody"
                ).innerHTML = `
                    <tr>
                        <td colspan="6"
                            style="text-align:center;">
                            No academic records found.
                        </td>
                    </tr>
                `;


                document.getElementById(
                    "totalCourses"
                ).textContent = "0";


                document.getElementById(
                    "averageScore"
                ).textContent = "0.0";


                document.getElementById(
                    "highestGrade"
                ).textContent = "-";


                document.getElementById(
                    "overallStatus"
                ).textContent =
                    "No Records";


                return;
            }


            // ==========================================
            // DISPLAY COURSES
            // ==========================================

            const tableBody =
                document.getElementById(
                    "gradeReportBody"
                );


            tableBody.innerHTML = "";


            let totalScore = 0;

            let validScores = 0;

            let highestGrade = "-";

            let allPassed = true;


            const gradeOrder = {
                "A": 5,
                "B": 4,
                "C": 3,
                "D": 2,
                "F": 1
            };


            records.forEach(
                function (record, index) {

                    const row =
                        document.createElement("tr");


                    // ==================================
                    // SCORE
                    // ==================================

                    const score =
                        Number(record.score);


                    if (!isNaN(score)) {

                        totalScore += score;

                        validScores++;

                    }


                    // ==================================
                    // GRADE
                    // ==================================

                    const grade =
                        record.grade || "-";


                    // ==================================
                    // RESULT
                    // ==================================

                    const result =
                        record.result || "-";


                    // ==================================
                    // HIGHEST GRADE
                    // ==================================

                    if (
                        highestGrade === "-" ||
                        (
                            (gradeOrder[grade] || 0) >
                            (gradeOrder[highestGrade] || 0)
                        )
                    ) {

                        highestGrade =
                            grade;

                    }


                    // ==================================
                    // OVERALL STATUS
                    // ==================================

                    if (
                        result &&
                        result.toLowerCase() === "fail"
                    ) {

                        allPassed = false;

                    }


                    if (
                        grade &&
                        grade.toUpperCase() === "F"
                    ) {

                        allPassed = false;

                    }


                    // ==================================
                    // CREATE TABLE ROW
                    // ==================================

                    row.innerHTML = `

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${record.course || "-"}
                        </td>

                        <td>
                            ${record.lecturer || "-"}
                        </td>

                        <td>
                            ${
                                record.score !== null &&
                                record.score !== undefined
                                    ? record.score
                                    : "-"
                            }
                        </td>

                        <td>
                            ${grade}
                        </td>

                        <td>
                            ${result}
                        </td>

                    `;


                    tableBody.appendChild(row);

                }
            );


            // ==========================================
            // CALCULATE SUMMARY
            // ==========================================

            const averageScore =
                validScores > 0
                    ? totalScore / validScores
                    : 0;


            document.getElementById(
                "totalCourses"
            ).textContent =
                records.length;


            document.getElementById(
                "averageScore"
            ).textContent =
                averageScore.toFixed(1);


            document.getElementById(
                "highestGrade"
            ).textContent =
                highestGrade;


            document.getElementById(
                "overallStatus"
            ).textContent =
                allPassed
                    ? "Passed"
                    : "Needs Improvement";


            console.log(
                "AYLI Grade Report loaded successfully.",
                {
                    ayliId: ayliId,
                    records: records.length
                }
            );

        } catch (error) {

            console.error(
                "Grade report error:",
                error
            );


            alert(
                "An error occurred while loading your grade report.\n\n" +
                error.message
            );

        }

    }
);