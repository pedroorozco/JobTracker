package com.orozcop.jobtracker.application;

import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<JobApplicationResponse> getApplications() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream().map(JobApplicationResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> createApplication(
            @Valid @RequestBody CreateJobApplicationRequest request
    ) {
        JobApplication application = new JobApplication(
                request.company().strip(),
                request.jobTitle().strip(),
                request.appliedOn()
        );

        JobApplication savedApplication = repository.save(application);

        return ResponseEntity.status(HttpStatus.CREATED).body(JobApplicationResponse.from(savedApplication));
    }

    @PatchMapping("/{id}/status")
    public JobApplicationResponse updateApplicationStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateJobApplicationStatusRequest request
    ) {
        JobApplication application = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job application not found"));
        application.changeStatus(request.status());
        JobApplication savedApplication = repository.save(application);
        return JobApplicationResponse.from(savedApplication);
    }
}
