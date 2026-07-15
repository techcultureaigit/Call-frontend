"use client";

import { Fragment } from "react";
import {
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  PERMISSION_MODULE_GROUPS,
  getModuleActions,
} from "@/config/permission-modules";
import type { NavModule } from "@/config/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { PermissionAction, RolePermissions } from "@/types/role";

interface PermissionMatrixProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
  disabled?: boolean;
  className?: string;
}

export function PermissionMatrix({
  permissions,
  onChange,
  disabled = false,
  className,
}: PermissionMatrixProps) {
  const updatePermission = (
    moduleId: NavModule,
    action: PermissionAction,
    checked: boolean
  ) => {
    onChange({
      ...permissions,
      [moduleId]: {
        ...permissions[moduleId],
        [action]: checked,
      },
    });
  };

  const toggleModuleRow = (moduleId: NavModule, checked: boolean) => {
    const actions = getModuleActions(moduleId);
    const next = { ...permissions[moduleId] };
    actions.forEach((action) => {
      next[action] = checked;
    });
    onChange({ ...permissions, [moduleId]: next });
  };

  const toggleActionColumn = (action: PermissionAction, checked: boolean) => {
    const next = { ...permissions };
    PERMISSION_MODULE_GROUPS.forEach((group) => {
      group.modules.forEach((module) => {
        const actions = getModuleActions(module.id);
        if (actions.includes(action)) {
          next[module.id] = { ...next[module.id], [action]: checked };
        }
      });
    });
    onChange(next);
  };

  const getRowState = (moduleId: NavModule) => {
    const actions = getModuleActions(moduleId);
    const values = actions.map((a) => permissions[moduleId][a]);
    const all = values.every(Boolean);
    const some = values.some(Boolean);
    return { all, some, indeterminate: some && !all };
  };

  const getColumnState = (action: PermissionAction) => {
    let total = 0;
    let checked = 0;
    PERMISSION_MODULE_GROUPS.forEach((group) => {
      group.modules.forEach((module) => {
        const actions = getModuleActions(module.id);
        if (actions.includes(action)) {
          total += 1;
          if (permissions[module.id][action]) checked += 1;
        }
      });
    });
    return {
      all: checked === total && total > 0,
      indeterminate: checked > 0 && checked < total,
    };
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/60", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Module
              </th>
              {PERMISSION_ACTIONS.map((action) => {
                const col = getColumnState(action);
                return (
                  <th
                    key={action}
                    className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span>{PERMISSION_ACTION_LABELS[action]}</span>
                      {!disabled && (
                        <Checkbox
                          checked={col.all}
                          indeterminate={col.indeterminate}
                          onChange={(e) =>
                            toggleActionColumn(action, e.target.checked)
                          }
                          aria-label={`Toggle all ${action}`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULE_GROUPS.map((group) => (
              <Fragment key={group.id}>
                <tr className="bg-muted/20">
                  <td
                    colSpan={5}
                    className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.modules.map((module) => {
                  const row = getRowState(module.id);
                  const moduleActions = getModuleActions(module.id);

                  return (
                    <tr
                      key={module.id}
                      className="border-b border-border/30 transition-colors hover:bg-muted/10"
                    >
                      <td className="sticky left-0 z-10 bg-card px-4 py-3">
                        <div className="flex items-center gap-3">
                          {!disabled && (
                            <Checkbox
                              checked={row.all}
                              indeterminate={row.indeterminate}
                              onChange={(e) =>
                                toggleModuleRow(module.id, e.target.checked)
                              }
                              aria-label={`Toggle all ${module.label}`}
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{module.label}</p>
                            {module.description && (
                              <p className="text-[10px] text-muted-foreground">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {PERMISSION_ACTIONS.map((action) => {
                        const isAvailable = moduleActions.includes(action);

                        return (
                          <td key={action} className="px-3 py-3 text-center">
                            {isAvailable ? (
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={permissions[module.id][action]}
                                  disabled={disabled}
                                  onChange={(e) =>
                                    updatePermission(
                                      module.id,
                                      action,
                                      e.target.checked
                                    )
                                  }
                                  aria-label={`${module.label} ${action}`}
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/30">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
