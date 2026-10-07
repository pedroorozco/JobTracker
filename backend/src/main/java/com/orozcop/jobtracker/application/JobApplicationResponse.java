package com.orozcop.jobtracker.application;

import java.time.LocalDate;

public record JobApplicationResponse (
        Long id,
        String company,
        String jobTitle,
        String status,
        LocalDate appliedOn
){
    public static JobApplicationResponse from(JobApplication application) {
        return new JobApplicationResponse(
                application.getId(),
                application.getCompany(),
                application.getJobTitle(),
                application.getStatus(),
                application.getAppliedOn()
        );
    }
}
