package com.orozcop.jobtracker.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateJobApplicationRequest (
    @NotBlank @Size(max = 255) String company,
    @NotBlank @Size(max = 255) String jobTitle,
    @NotNull LocalDate appliedOn
) {
}
