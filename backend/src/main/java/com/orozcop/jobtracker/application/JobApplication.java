package com.orozcop.jobtracker.application;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 255)
    private String company;

    @Column(name = "job_title", nullable = false, length = 255)
    private String jobTitle;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;

    protected JobApplication() {

    }

    public JobApplication(String company, String jobTitle, LocalDate appliedOn) {
        this.company = company;
        this.jobTitle = jobTitle;
        this.status = "Applied";
        this.appliedOn = appliedOn;
    }

    public long getId() {
        return id;
    }

    public String getCompany() {
        return company;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getAppliedOn() {
        return appliedOn;
    }

    public void changeStatus(String status) {
        this.status = status;
    }
}
