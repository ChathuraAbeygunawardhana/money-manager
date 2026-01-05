"use client";

import Button from "../atoms/Button";
import LoadingSpinner from "../atoms/LoadingSpinner";

interface PageHeaderProps {
  selectedCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onBulkDelete: () => void;
  onCreateUser: () => void;
  onBulkCreate: () => void;
}

export default function PageHeader({
  selectedCount,
  isRefreshing,
  onRefresh,
  onBulkDelete,
  onCreateUser,
  onBulkCreate
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Users</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Manage user accounts and permissions</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {selectedCount > 0 && (
          <Button
            onClick={onBulkDelete}
            variant="danger"
            size="lg"
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Delete Selected ({selectedCount})
          </Button>
        )}
        
        <Button
          onClick={onRefresh}
          variant="secondary"
          size="lg"
          disabled={isRefreshing}
          className="w-full sm:w-auto whitespace-nowrap"
          title="Refresh users list"
        >
          {isRefreshing ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Refreshing...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </div>
          )}
        </Button>
        
        <Button
          onClick={onCreateUser}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto whitespace-nowrap"
        >
          Create User
        </Button>
        
        <Button
          onClick={onBulkCreate}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto whitespace-nowrap"
        >
          Bulk Create
        </Button>
      </div>
    </div>
  );
}