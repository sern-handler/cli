package components

import (
	"fmt"
	"os"

	"github.com/erikgeiser/promptkit/selection"
	"github.com/erikgeiser/promptkit/textinput"
)

func NewInput(prompt string, placeholder string) string {
	input := textinput.New(prompt)
	input.Placeholder = placeholder

	result, err := input.RunPrompt()

	if err != nil {
		fmt.Printf("Error: %v\n", err)

		os.Exit(1)
	}

	return result
}

func NewSelection(prompt string, options []string) string {
	sp := selection.New(prompt,
		selection.Choices(options))

	choice, err := sp.RunPrompt()

	if err != nil {
		fmt.Printf("Error: %v\n", err)

		os.Exit(1)
	}

	return choice.String
}
