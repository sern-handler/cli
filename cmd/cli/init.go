package cli

import (
	"github.com/sern-handler/cli/pkg/initialize"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize a new Sern project.",
	Long:  `Initialize a new Sern project, either with a JavaScript or a TypeScript template.`,
	Run: func(cmd *cobra.Command, args []string) {
		initialize.Initialize()
	},
}
