package com.collegelostandfound.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Fields a student may update on their own profile, per the API contract.
 * The user id always comes from the authenticated JWT, never from this body.
 */
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String studentName;

    @NotBlank
    @Size(max = 100)
    private String className;

    @Size(max = 500)
    private String profileImageUrl;

    public UpdateProfileRequest() {
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}