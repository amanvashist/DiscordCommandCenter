interface CommandPreviewProps {
  name: string;
  icon: string;
  description: string;
  usage: string;
  response: string;
  note: string;
}

export default function CommandPreview({
  name,
  icon,
  description,
  usage,
  response,
  note
}: CommandPreviewProps) {
  return (
    <div className="bg-discord-dark rounded-lg overflow-hidden shadow-lg border border-gray-800">
      <div className="p-4 bg-discord-darker border-b border-gray-800 flex items-center">
        <i className={`${icon} text-xl text-discord-blue mr-2`}></i>
        <h3 className="font-medium">/{name} Command</h3>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-discord-light text-sm mb-2">{description}</p>
        </div>
        
        <div className="bg-discord-darkest rounded-md p-3 mb-4 font-mono text-sm">
          <div className="text-blue-400">/{name}</div>
          <div className="pl-4 text-discord-lighter">
            {usage.substring(usage.indexOf(' ') + 1)}
          </div>
        </div>
        
        <div className="bg-discord-darkest rounded-md p-3 mb-4">
          <div className="flex mb-2">
            <div className="h-8 w-8 rounded-full bg-discord-blue flex items-center justify-center mr-2">
              <i className="ri-robot-line text-sm"></i>
            </div>
            <div>
              <div className="font-medium">Poppy Bot</div>
              <div className="text-xs text-discord-light">BOT</div>
            </div>
          </div>
          <div className="text-discord-lighter whitespace-pre-line">
            {response}
          </div>
        </div>
        
        <div className="text-sm text-discord-light">
          <i className="ri-information-line mr-1"></i> {note}
        </div>
      </div>
    </div>
  );
}
