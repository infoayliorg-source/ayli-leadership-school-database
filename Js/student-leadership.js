// ==========================================================
// AYLI STUDENT LEADERSHIP
// ==========================================================


// ==========================================================
// SUPABASE CONNECTION
// ==========================================================

const LEADERSHIP_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";


const LEADERSHIP_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


const leadershipSupabaseClient =
    supabase.createClient(
        LEADERSHIP_SUPABASE_URL,
        LEADERSHIP_SUPABASE_KEY
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
// LOAD STUDENT LEADERSHIP
// ==========================================================

async function loadStudentLeadership() {

    try {

        // --------------------------------------------------
        // LOAD STUDENT INFORMATION
        // --------------------------------------------------

        const {
            data: student,
            error: studentError
        } = await leadershipSupabaseClient
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
                "studentLeadershipName"
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
            "studentLeadershipName"
        ).textContent =
            fullName ||
            "My Leadership";


        // --------------------------------------------------
        // LOAD STUDENT LEADERSHIP RECORDS
        // --------------------------------------------------

        const {
            data: leaders,
            error: leadershipError
        } = await leadershipSupabaseClient
            .from("leadership")
            .select(`
                id,
                ayli_id,
                position,
                start_date,
                chapter,
                status
            `)
            .eq(
                "ayli_id",
                ayliId
            )
            .order(
                "start_date",
                {
                    ascending: false
                }
            );


        const recordsBody =
            document.getElementById(
                "leadershipRecordsBody"
            );


        if (leadershipError) {

            console.error(
                "Leadership loading error:",
                leadershipError
            );

            recordsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load leadership records.
                    </td>
                </tr>
            `;

            return;

        }


        // --------------------------------------------------
        // NO LEADERSHIP RECORDS
        // --------------------------------------------------

        if (
            !leaders ||
            leaders.length === 0
        ) {

            recordsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No leadership positions found.
                    </td>
                </tr>
            `;


            document.getElementById(
                "totalLeadershipPositions"
            ).textContent =
                "0";


            document.getElementById(
                "activeLeadershipPositions"
            ).textContent =
                "0";

            return;

        }


        // --------------------------------------------------
        // DISPLAY LEADERSHIP RECORDS
        // --------------------------------------------------

        recordsBody.innerHTML =
            leaders
                .map(
                    leader => {

                        const formattedDate =
                            leader.start_date
                                ? new Date(
                                    leader.start_date
                                ).toLocaleDateString()
                                : "-";


                        return `
                            <tr>

                                <td>
                                    ${leader.position || "-"}
                                </td>

                                <td>
                                    ${leader.chapter || "-"}
                                </td>

                                <td>
                                    ${formattedDate}
                                </td>

                                <td>
                                    ${leader.status || "-"}
                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


        // --------------------------------------------------
        // TOTAL POSITIONS
        // --------------------------------------------------

        document.getElementById(
            "totalLeadershipPositions"
        ).textContent =
            leaders.length;


        // --------------------------------------------------
        // ACTIVE POSITIONS
        // --------------------------------------------------

        const activePositions =
            leaders.filter(
                leader =>
                    String(
                        leader.status || ""
                    )
                    .toLowerCase() ===
                    "active"
            );


        document.getElementById(
            "activeLeadershipPositions"
        ).textContent =
            activePositions.length;


    } catch (error) {

        console.error(
            "Student leadership page error:",
            error
        );

        document.getElementById(
            "leadershipRecordsBody"
        ).innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load leadership records.
                </td>
            </tr>
        `;

    }

}


// ==========================================================
// START
// ==========================================================

loadStudentLeadership();