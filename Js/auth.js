// ==========================================================
// AYLI SUPABASE AUTHENTICATION GUARD
// ==========================================================

const SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";


let supabaseClient;


// ==========================================================
// LOAD SUPABASE
// ==========================================================

function loadSupabase() {

    return new Promise(function (resolve, reject) {

        // Supabase already loaded
        if (window.supabase) {

            resolve();

            return;
        }


        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload =
            function () {

                resolve();

            };


        script.onerror =
            function () {

                reject(
                    new Error(
                        "Failed to load Supabase."
                    )
                );

            };


        document.head.appendChild(script);

    });

}


// ==========================================================
// INITIALIZE AUTHENTICATION
// ==========================================================

async function initializeAuth() {

    try {

        await loadSupabase();


        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        await checkAuthentication();

    }
    catch (error) {

        console.error(
            "Authentication initialization error:",
            error
        );

    }

}


// ==========================================================
// CHECK AUTHENTICATION
// ==========================================================

async function checkAuthentication() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();


    if (error || !session) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


// ==========================================================
// LOGOUT
// ==========================================================

async function logout() {

    if (!supabaseClient) {

        return;

    }


    await supabaseClient.auth.signOut();


    window.location.href =
        "login.html";

}


// ==========================================================
// START AUTHENTICATION
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAuth();

    }
);