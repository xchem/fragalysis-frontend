"""Unit tests for dependabot_alert_severity.py (issue #561).

Run with: python3 -m unittest discover -s .github/scripts
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest

from dependabot_alert_severity import highest_severity, normalise_name, should_merge

_SCRIPT = os.path.join(os.path.dirname(__file__), "dependabot_alert_severity.py")


def _alert(name, severity, state="open", ecosystem="npm"):
    """Return a minimal Dependabot alert, as the GitHub alerts API returns it."""
    return {
        "state": state,
        "dependency": {"package": {"ecosystem": ecosystem, "name": name}},
        "security_advisory": {"severity": severity},
    }


class NormaliseNameTest(unittest.TestCase):
    def test_strips_whitespace(self):
        self.assertEqual(normalise_name(" lodash "), "lodash")

    def test_is_case_insensitive(self):
        self.assertEqual(normalise_name("JSONStream"), "jsonstream")

    def test_keeps_a_scoped_name(self):
        self.assertEqual(normalise_name("@babel/core"), "@babel/core")

    def test_does_not_join_names_that_differ_in_punctuation(self):
        # npm names are not PEP 503 names: 'lodash.merge' is not 'lodash-merge'
        self.assertNotEqual(normalise_name("lodash.merge"), normalise_name("lodash-merge"))


class HighestSeverityTest(unittest.TestCase):
    def test_no_alerts(self):
        self.assertIsNone(highest_severity([], ["axios"]))

    def test_alert_for_another_package(self):
        self.assertIsNone(highest_severity([_alert("lodash", "critical")], ["axios"]))

    def test_matches_a_scoped_name(self):
        alerts = [_alert("@babel/traverse", "critical")]
        self.assertEqual(highest_severity(alerts, ["@babel/traverse"]), "critical")

    def test_returns_the_highest_of_several(self):
        alerts = [
            _alert("axios", "low"),
            _alert("axios", "critical"),
            _alert("axios", "medium"),
        ]
        self.assertEqual(highest_severity(alerts, ["axios"]), "critical")

    def test_considers_every_dependency_of_a_grouped_pull_request(self):
        alerts = [_alert("axios", "medium"), _alert("follow-redirects", "high")]
        self.assertEqual(
            highest_severity(alerts, ["axios", "follow-redirects"]), "high"
        )

    def test_ignores_alerts_that_are_not_open(self):
        alerts = [
            _alert("axios", "critical", state="dismissed"),
            _alert("axios", "critical", state="fixed"),
        ]
        self.assertIsNone(highest_severity(alerts, ["axios"]))

    def test_ignores_an_unknown_severity(self):
        self.assertIsNone(highest_severity([_alert("axios", "unknown")], ["axios"]))


class ShouldMergeTest(unittest.TestCase):
    def test_severity_at_threshold_merges(self):
        self.assertTrue(should_merge([_alert("axios", "high")], ["axios"], "high"))

    def test_severity_above_threshold_merges(self):
        self.assertTrue(should_merge([_alert("axios", "critical")], ["axios"], "high"))

    def test_severity_below_threshold_does_not_merge(self):
        self.assertFalse(should_merge([_alert("axios", "medium")], ["axios"], "high"))

    def test_no_alert_does_not_merge(self):
        self.assertFalse(should_merge([], ["axios"], "low"))

    def test_threshold_is_case_insensitive(self):
        self.assertTrue(should_merge([_alert("axios", "high")], ["axios"], "HIGH"))

    def test_invalid_threshold_is_an_error(self):
        with self.assertRaises(ValueError):
            should_merge([_alert("axios", "high")], ["axios"], "severe")


class CommandLineTest(unittest.TestCase):
    def _run(self, alerts, dependencies, min_severity):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump(alerts, f)
        try:
            return subprocess.run(
                [
                    sys.executable,
                    _SCRIPT,
                    "--alerts",
                    f.name,
                    "--dependencies",
                    dependencies,
                    "--min-severity",
                    min_severity,
                ],
                capture_output=True,
                text=True,
                check=False,
            )
        finally:
            os.unlink(f.name)

    def test_prints_true_when_the_pull_request_must_merge(self):
        result = self._run([_alert("axios", "high")], "axios, lodash", "high")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "true")

    def test_prints_false_when_the_pull_request_must_not_merge(self):
        result = self._run([_alert("axios", "low")], "axios", "high")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "false")

    def test_invalid_threshold_fails(self):
        result = self._run([], "axios", "severe")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("severe", result.stderr)


if __name__ == "__main__":
    unittest.main()
