package notification

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRenderTemplate_Basic(t *testing.T) {
	subj := "Registration Received - {{.portal_title}}"
	body := "<h1>Hello {{.full_name}}</h1><p>Welcome to {{.event_name}}!</p>"

	data := map[string]interface{}{
		"portal_title": "Musyawarah Nasional",
		"full_name":    "Budi Santoso",
		"event_name":   "Musyawarah Nasional",
	}

	renderedSubj, renderedBody, err := RenderTemplate(&subj, body, data)
	assert.NoError(t, err)
	assert.Equal(t, "Registration Received - Musyawarah Nasional", renderedSubj)
	assert.Equal(t, "<h1>Hello Budi Santoso</h1><p>Welcome to Musyawarah Nasional!</p>", renderedBody)
}

func TestRenderTemplate_NormalizeWithoutDot(t *testing.T) {
	subj := "Update - {{portal_title}}"
	body := "Hello {{full_name}}, your code is {{registration_number}}."

	data := map[string]interface{}{
		"portal_title":        "Portal Muskom",
		"full_name":           "Siti Rahma",
		"registration_number": "REG-12345",
	}

	renderedSubj, renderedBody, err := RenderTemplate(&subj, body, data)
	assert.NoError(t, err)
	assert.Equal(t, "Update - Portal Muskom", renderedSubj)
	assert.Equal(t, "Hello Siti Rahma, your code is REG-12345.", renderedBody)
}

func TestRenderTemplate_WithControlFlow(t *testing.T) {
	body := `{{if .rejection_reason}}<p>Reason: {{.rejection_reason}}</p>{{else}}<p>Approved!</p>{{end}}`

	dataWithReason := map[string]interface{}{
		"rejection_reason": "Dokumen tidak lengkap",
	}
	_, rendered1, err1 := RenderTemplate(nil, body, dataWithReason)
	assert.NoError(t, err1)
	assert.Equal(t, "<p>Reason: Dokumen tidak lengkap</p>", rendered1)

	dataWithoutReason := map[string]interface{}{}
	_, rendered2, err2 := RenderTemplate(nil, body, dataWithoutReason)
	assert.NoError(t, err2)
	assert.Equal(t, "<p>Approved!</p>", rendered2)
}

func TestRenderTemplate_NilSubject(t *testing.T) {
	body := "<p>Simple Body</p>"
	renderedSubj, renderedBody, err := RenderTemplate(nil, body, nil)
	assert.NoError(t, err)
	assert.Equal(t, "", renderedSubj)
	assert.Equal(t, "<p>Simple Body</p>", renderedBody)
}
