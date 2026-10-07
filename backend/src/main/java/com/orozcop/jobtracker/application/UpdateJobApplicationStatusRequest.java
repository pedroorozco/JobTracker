package com.orozcop.jobtracker.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateJobApplicationStatusRequest(
    @NotBlank
    @Pattern(
            regexp = "Applied|Interview Pending|Obtained Offer|Rejected",
            message= "Status must be Applied, Interview Pending, Obtained Offer, or Rejected"
    )
    String status
) {}
