package initialize

import (
	"fmt"
	"os"
	"strings"

	"github.com/go-git/go-git/v5"
)

func cloneRepository(name string, language string) {
	_, err := git.PlainClone("templates", false, &git.CloneOptions{
		URL:      "https://github.com/sern-handler/templates",
		Progress: os.Stdout,
	})

	if err != nil {
		fmt.Println("Couldn't install the template, exiting.")

		return
	}

	err = os.Rename("templates/templates/"+strings.ToLower(language), name)

	if err != nil {
		fmt.Println("Couldn't install the template, exiting.")
	}

	err = os.RemoveAll("templates")

	if err != nil {
		return
	}
}
