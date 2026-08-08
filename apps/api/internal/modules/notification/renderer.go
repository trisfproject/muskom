package notification

import (
	"bytes"
	"fmt"
	"html/template"
	"regexp"
	"strings"
)

var (
	// Matches {{variable_name}} that doesn't start with . and isn't a template keyword
	templateVarRegex = regexp.MustCompile(`\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}`)
	reservedKeywords = map[string]bool{
		"if":       true,
		"else":     true,
		"end":      true,
		"range":    true,
		"with":     true,
		"define":   true,
		"template": true,
		"block":    true,
		"nil":      true,
		"true":     true,
		"false":    true,
	}
)

// NormalizeTemplateVariables converts {{variable_name}} to {{.variable_name}} if missing dot
func NormalizeTemplateVariables(tmpl string) string {
	return templateVarRegex.ReplaceAllStringFunc(tmpl, func(m string) string {
		submatches := templateVarRegex.FindStringSubmatch(m)
		if len(submatches) < 2 {
			return m
		}
		varName := submatches[1]
		if reservedKeywords[strings.ToLower(varName)] {
			return m
		}
		return fmt.Sprintf("{{.%s}}", varName)
	})
}

// RenderTemplate renders both subject and body templates using the provided data map.
func RenderTemplate(subjectTmpl *string, bodyTmpl string, data map[string]interface{}) (string, string, error) {
	if data == nil {
		data = make(map[string]interface{})
	}

	// 1. Render Body
	normBody := NormalizeTemplateVariables(bodyTmpl)
	parsedBody, err := template.New("body").Parse(normBody)
	if err != nil {
		return "", "", fmt.Errorf("failed to parse body template: %w", err)
	}

	var bodyBuf bytes.Buffer
	if err := parsedBody.Execute(&bodyBuf, data); err != nil {
		return "", "", fmt.Errorf("failed to execute body template: %w", err)
	}
	body := bodyBuf.String()

	// 2. Render Subject
	var subject string
	if subjectTmpl != nil && *subjectTmpl != "" {
		normSubj := NormalizeTemplateVariables(*subjectTmpl)
		parsedSubj, err := template.New("subject").Parse(normSubj)
		if err != nil {
			// Fallback to raw subject if template parse fails
			subject = *subjectTmpl
		} else {
			var subjBuf bytes.Buffer
			if err := parsedSubj.Execute(&subjBuf, data); err != nil {
				subject = *subjectTmpl
			} else {
				subject = subjBuf.String()
			}
		}
	}

	return subject, body, nil
}
