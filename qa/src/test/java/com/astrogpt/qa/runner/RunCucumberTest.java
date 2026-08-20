package com.astrogpt.qa.runner;

import org.junit.platform.suite.api.*;

/**
 * Cucumber test suite runner.
 * Run with: mvn test -Dapp.url=http://localhost:4200
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = "cucumber.plugin", value =
        "pretty," +
        "json:target/cucumber-reports/cucumber.json," +
        "html:target/cucumber-reports/cucumber.html," +
        "junit:target/cucumber-reports/cucumber.xml")
@ConfigurationParameter(key = "cucumber.publish.quiet", value = "true")
@ConfigurationParameter(key = "cucumber.glue", value = "com.astrogpt.qa.steps")
public class RunCucumberTest {}
