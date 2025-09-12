"use strict";
/**
 * Survey API Test Examples
 *
 * This file demonstrates how to use the new Survey API endpoints
 * to match the required response format.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStep4Example = exports.updateStep3Example = exports.updateStep2Example = exports.updateStep1Example = exports.resetOnboardingExample = exports.getOnboardingSurveyExample = exports.completeOnboardingExample = void 0;
// Example API calls:
/**
 * 1. GET /api/survey/onboarding
 * Get current onboarding survey state
 */
const getOnboardingSurveyExample = {
    method: 'GET',
    url: '/api/survey/onboarding',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    },
    expectedResponse: {
        success: true,
        data: {
            userId: "string",
            onboardingSteps: [
                {
                    stepNumber: 1,
                    hasCompleted: false,
                    data: {}
                },
                {
                    stepNumber: 2,
                    hasCompleted: false,
                    data: {}
                },
                {
                    stepNumber: 3,
                    hasCompleted: false,
                    data: {}
                },
                {
                    stepNumber: 4,
                    hasCompleted: false,
                    data: {}
                }
            ]
        }
    }
};
exports.getOnboardingSurveyExample = getOnboardingSurveyExample;
/**
 * 2. POST /api/survey/onboarding/step
 * Update Step 1 - Job Search Situation
 */
const updateStep1Example = {
    method: 'POST',
    url: '/api/survey/onboarding/step',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    },
    body: {
        stepNumber: 1,
        data: {
            situation: "I'm open to new opportunities, no rush"
        }
    }
};
exports.updateStep1Example = updateStep1Example;
/**
 * 3. POST /api/survey/onboarding/step
 * Update Step 2 - Career Goals (generates backendStats)
 */
const updateStep2Example = {
    method: 'POST',
    url: '/api/survey/onboarding/step',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    },
    body: {
        stepNumber: 2,
        data: {
            careerGoal: "Get a promotion",
            pathPreference: "Shift My Career Path"
        }
    },
    expectedResponse: {
        success: true,
        message: "Step 2 updated successfully",
        data: {
            userId: "string",
            onboardingSteps: [
                {
                    stepNumber: 1,
                    hasCompleted: true,
                    data: {
                        situation: "I'm open to new opportunities, no rush"
                    }
                },
                {
                    stepNumber: 2,
                    hasCompleted: true,
                    data: {
                        careerGoal: "Get a promotion",
                        pathPreference: "Shift My Career Path"
                    },
                    backendStats: {
                        remoteJobs: "520+",
                        medianSalary: "$145,550+",
                        softwareAndRecruiting: "High demand in shift my career path with focus on get a promotion",
                        recentJobs: "239+",
                        hotSkills: [
                            {
                                skill: "Embedded Linux",
                                level: 0.9
                            },
                            {
                                skill: "React.js",
                                level: 0.85
                            }
                        ],
                        analyticalSkills: 0.85
                    }
                },
                {
                    stepNumber: 3,
                    hasCompleted: false,
                    data: {}
                },
                {
                    stepNumber: 4,
                    hasCompleted: false,
                    data: {}
                }
            ]
        }
    }
};
exports.updateStep2Example = updateStep2Example;
/**
 * 4. POST /api/survey/onboarding/step
 * Update Step 3 - Job Preferences
 */
const updateStep3Example = {
    method: 'POST',
    url: '/api/survey/onboarding/step',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    },
    body: {
        stepNumber: 3,
        data: {
            jobFunction: "Backend Engineer",
            jobType: ["Full-time", "Contract"],
            location: "Within US",
            openToRemote: true,
            h1bSponsorship: false
        }
    }
};
exports.updateStep3Example = updateStep3Example;
/**
 * 5. POST /api/survey/onboarding/step
 * Update Step 4 - Resume Upload (optional)
 */
const updateStep4Example = {
    method: 'POST',
    url: '/api/survey/onboarding/step',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    },
    body: {
        stepNumber: 4,
        data: {
            resumeUrl: "https://example.com/path/to/resume.pdf" // Optional
        }
    }
};
exports.updateStep4Example = updateStep4Example;
/**
 * 6. POST /api/survey/onboarding/complete
 * Complete the entire onboarding survey
 */
const completeOnboardingExample = {
    method: 'POST',
    url: '/api/survey/onboarding/complete',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    },
    expectedResponse: {
        success: true,
        message: "Onboarding survey completed successfully",
        data: {
            userId: "string",
            onboardingSteps: [
                {
                    stepNumber: 1,
                    hasCompleted: true,
                    data: {
                        situation: "I'm open to new opportunities, no rush"
                    }
                },
                {
                    stepNumber: 2,
                    hasCompleted: true,
                    data: {
                        careerGoal: "Get a promotion",
                        pathPreference: "Shift My Career Path"
                    },
                    backendStats: {
                        remoteJobs: "520+",
                        medianSalary: "$145,550+",
                        softwareAndRecruiting: "High demand in shift my career path with focus on get a promotion",
                        recentJobs: "239+",
                        hotSkills: [
                            {
                                skill: "Embedded Linux",
                                level: 0.9
                            }
                        ],
                        analyticalSkills: 0.85
                    }
                },
                {
                    stepNumber: 3,
                    hasCompleted: true,
                    data: {
                        jobFunction: "Backend Engineer",
                        jobType: ["Full-time", "Contract"],
                        location: "Within US",
                        openToRemote: true,
                        h1bSponsorship: false
                    }
                },
                {
                    stepNumber: 4,
                    hasCompleted: true,
                    data: {
                        resumeUrl: "https://example.com/path/to/resume.pdf"
                    }
                }
            ]
        }
    }
};
exports.completeOnboardingExample = completeOnboardingExample;
/**
 * 7. DELETE /api/survey/onboarding/reset
 * Reset the onboarding survey
 */
const resetOnboardingExample = {
    method: 'DELETE',
    url: '/api/survey/onboarding/reset',
    headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'application/json'
    }
};
exports.resetOnboardingExample = resetOnboardingExample;
