package cli

import (
	"github.com/sern-handler/cli/pkg/extra"
	"github.com/spf13/cobra"
)

var extraCmd = &cobra.Command{
	Use:   "extra",
	Short: "Add extra tools to your Sern project.",
	Long:  `Add extra tools to your Sern project to help you with the setup and development.`,
	Run: func(cmd *cobra.Command, args []string) {
		extra.Execute()
	},
}
