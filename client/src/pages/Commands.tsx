import CommandPreview from "@/components/CommandPreview";

export default function Commands() {
  return (
    <main className="p-4 md:p-6 flex-1 overflow-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Bot Commands Preview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CommandPreview 
            name="ask"
            icon="ri-question-line"
            description="This command allows users to ask questions to Poppy AI directly in Discord."
            usage="/ask question: What is the capital of France?"
            response="The capital of France is Paris. It's one of the world's most popular tourist destinations and is known for landmarks like the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral."
            note="Parameters are processed through the Poppy AI API with user-specific configurations."
          />
          
          <CommandPreview 
            name="summary"
            icon="ri-file-list-line"
            description="This command summarizes Discord thread content to help users catch up quickly."
            usage="/summary thread: #project-discussion"
            response={`**Thread Summary (#project-discussion):**\n\nThe team discussed the upcoming website redesign project. Key points:\n\n• Timeline: Launch planned for Q2 2023\n• Design: Mobile-first approach with new color scheme\n• Tech stack: React, Node.js, MongoDB\n• Next steps: Design mockups due by Friday`}
            note="Thread messages are extracted, sent to Poppy AI, and a concise summary is returned."
          />
        </div>
      </div>
      
      <div className="bg-discord-dark rounded-lg p-6 border border-gray-800 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="ri-information-line text-xl text-discord-blue mr-2"></i>
          Command Documentation
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2 text-discord-lighter">Setting Up the Bot</h4>
            <p className="text-discord-light">
              To add the bot to your Discord server, use the invitation link provided by your administrator. 
              Once added, the bot will respond to the slash commands described below.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-discord-lighter">Command Permissions</h4>
            <p className="text-discord-light">
              Command access is controlled through this dashboard. Administrators can configure which 
              users have access to each command using the User Configuration page.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-discord-lighter">API Usage Considerations</h4>
            <p className="text-discord-light">
              Each command uses Poppy AI API requests with the configured parameters for each user. 
              Keep in mind that extensive use might lead to rate limiting or increased API costs.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-auto p-4 text-center text-discord-light text-sm border-t border-discord-darkest mt-6">
        <p>Poppy AI Discord Bot Dashboard &copy; {new Date().getFullYear()} | v1.0.0</p>
      </footer>
    </main>
  );
}
