// Test script to debug authentication issues
const API_BASE_URL = "http://localhost:8080/api";

async function testAuthEndpoint() {
  console.log("Testing authentication endpoint...");

  const testCredentials = {
    email: "recruiter@gmail.com",
    password: "admin123",
  };

  try {
    console.log("1. Testing server connectivity...");
    const healthCheck = await fetch("http://localhost:8080/", {
      method: "GET",
      mode: "cors",
    });
    console.log("Server response status:", healthCheck.status);

    console.log("2. Testing auth/login endpoint...");
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCredentials),
    });

    console.log("Login response status:", response.status);
    console.log(
      "Login response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Login response body:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("✅ Login successful!");
      console.log("Token received:", data.data?.token ? "Yes" : "No");

      // Test using the token
      if (data.data?.token) {
        console.log("3. Testing authenticated endpoint...");
        const profileResponse = await fetch(`${API_BASE_URL}/me/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.data.token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Profile response status:", profileResponse.status);
        const profileText = await profileResponse.text();
        console.log("Profile response body:", profileText);
      }
    } else {
      console.log("❌ Login failed");
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

// Test with candidate credentials too
async function testCandidateAuth() {
  console.log("\nTesting candidate authentication...");

  const candidateCredentials = {
    email: "candidate@gmail.com",
    password: "admin123",
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidateCredentials),
    });

    console.log("Candidate login response status:", response.status);
    const responseText = await response.text();
    console.log("Candidate login response body:", responseText);

    if (response.ok) {
      console.log("✅ Candidate login successful!");
    } else {
      console.log("❌ Candidate login failed");
    }
  } catch (error) {
    console.error("❌ Candidate auth error:", error.message);
  }
}

// Run tests
testAuthEndpoint()
  .then(() => {
    return testCandidateAuth();
  })
  .then(() => {
    console.log("\n🔍 Authentication tests completed");
  });
