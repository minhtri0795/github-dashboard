import { PullRequest } from '../types/github';

interface PRListProps {
  title: string;
  prs: PullRequest[];
  description?: string;
}

export function PRList({ title, prs, description }: PRListProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {prs.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-500">No pull requests found</p>
            </li>
          ) : (
            <></>
            // prs.map((pr) => (
            //   <li key={pr.prNumber} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            //     <div className="flex flex-col space-y-1">
            //       <div className="flex items-center justify-between">
            //         <a
            //           href={pr.html_url}
            //           target="_blank"
            //           rel="noopener noreferrer"
            //           className="text-sm font-medium text-indigo-600 hover:text-indigo-900 truncate"
            //         >
            //           {pr.title}
            //         </a>
            //         <span className="text-sm text-gray-500">#{pr.prNumber}</span>
            //       </div>
            //       <div className="flex items-center space-x-2 text-sm text-gray-500">
            //         <span>{pr.repository}</span>
            //         <span>•</span>
            //         <span>by {pr.user.login}</span>
            //         <span>•</span>
            //         <span>{new Date(pr.created_at).toLocaleDateString()}</span>
            //       </div>
            //     </div>
            //   </li>
            // ))
          )}
        </ul>
      </div>
    </div>
  );
}
