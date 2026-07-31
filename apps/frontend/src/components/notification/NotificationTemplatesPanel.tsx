"use client";

import { MessageSquare, Mail, Send } from "lucide-react";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
}

export function NotificationTemplatesPanel({ templates }: { templates: Template[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((tpl) => (
        <div key={tpl.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="font-medium text-slate-900">{tpl.name}</h4>
            {tpl.channel === 'EMAIL' && <Mail className="w-4 h-4 text-slate-400" />}
            {tpl.channel === 'WHATSAPP' && <MessageSquare className="w-4 h-4 text-green-500" />}
            {tpl.channel === 'TELEGRAM' && <Send className="w-4 h-4 text-blue-400" />}
          </div>
          <div className="p-4 flex-1">
            {tpl.subject && (
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Subject</span>
                <p className="text-sm font-medium text-slate-900 truncate">{tpl.subject}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Body Pattern</span>
              <p className="text-sm text-slate-700 mt-1 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-xs">
                {tpl.body}
              </p>
            </div>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit Template</button>
          </div>
        </div>
      ))}
      
      {templates.length === 0 && (
        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">No templates defined.</p>
        </div>
      )}
    </div>
  );
}
