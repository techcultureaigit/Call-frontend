"use client";

import { Fragment, useState } from "react";
import {
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  PERMISSION_MODULE_GROUPS,
  emptyModulePermissions,
  getModuleActions,
  walkPermissionModules,
  type PermissionModuleConfig,
} from "@/config/permission-modules";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ModulePermissions, PermissionAction, RolePermissions } from "@/types/role";

interface PermissionMatrixProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
  disabled?: boolean;
  className?: string;
}

const ACTION_SHORT: Record<PermissionAction, string> = {
  create: "C",
  read: "R",
  update: "U",
  delete: "D",
  export: "Ex",
  import: "Im",
  upload: "Up",
  download: "Dl",
  publish: "Pb",
};

function clonePermissions(permissions: RolePermissions): RolePermissions {
  const next = {} as RolePermissions;
  for (const key of Object.keys(permissions) as (keyof RolePermissions)[]) {
    next[key] = { ...permissions[key] };
  }
  return next;
}

function ensureRow(
  next: RolePermissions,
  moduleId: string
): ModulePermissions {
  if (!next[moduleId as keyof RolePermissions]) {
    next[moduleId as keyof RolePermissions] = emptyModulePermissions(moduleId);
  }
  return next[moduleId as keyof RolePermissions];
}

export function PermissionMatrix({
  permissions,
  onChange,
  disabled = false,
  className,
}: PermissionMatrixProps) {
  /** Row currently being edited — stays highlighted until another module is focused */
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  /** Next checked value for tri-state: indeterminate/unchecked → all on; all on → off */
  const nextTriState = (all: boolean, indeterminate: boolean) =>
    indeterminate || !all;

  /** Set one action on a module and cascade to every descendant */
  const toggleModuleAction = (
    module: PermissionModuleConfig,
    action: PermissionAction,
    checked: boolean
  ) => {
    setActiveModuleId(module.id);
    const next = clonePermissions(permissions);
    const apply = (mod: PermissionModuleConfig) => {
      if (getModuleActions(mod.id).includes(action)) {
        const row = ensureRow(next, mod.id);
        next[mod.id as keyof RolePermissions] = { ...row, [action]: checked };
      }
      mod.children?.forEach(apply);
    };
    apply(module);
    onChange(next);
  };

  /** Toggle every action on this module + all descendants (skips indicators) */
  const toggleModuleRow = (
    module: PermissionModuleConfig,
    checked: boolean
  ) => {
    setActiveModuleId(module.id);
    const next = clonePermissions(permissions);
    const apply = (mod: PermissionModuleConfig) => {
      const actions = getModuleActions(mod.id);
      if (actions.length > 0) {
        const row = {
          ...emptyModulePermissions(mod.id),
          ...ensureRow(next, mod.id),
        };
        actions.forEach((action) => {
          row[action] = checked;
        });
        next[mod.id as keyof RolePermissions] = row;
      }
      mod.children?.forEach(apply);
    };
    apply(module);
    onChange(next);
  };

  const toggleActionColumn = (action: PermissionAction, checked: boolean) => {
    setActiveModuleId(null);
    const next = clonePermissions(permissions);
    walkPermissionModules().forEach((module) => {
      if (getModuleActions(module.id).includes(action)) {
        const row = ensureRow(next, module.id);
        next[module.id as keyof RolePermissions] = {
          ...row,
          [action]: checked,
        };
      }
    });
    onChange(next);
  };

  const getRowState = (module: PermissionModuleConfig) => {
    const collect = (mod: PermissionModuleConfig): boolean[] => {
      const actions = getModuleActions(mod.id);
      const self = actions.map((a) => Boolean(permissions[mod.id]?.[a]));
      const kids = mod.children?.flatMap(collect) ?? [];
      return [...self, ...kids];
    };
    const values = collect(module);
    const all = values.length > 0 && values.every(Boolean);
    const some = values.some(Boolean);
    return { all, indeterminate: some && !all };
  };

  /** Parent action cell reflects self + all children for this action */
  const getModuleActionState = (
    module: PermissionModuleConfig,
    action: PermissionAction
  ) => {
    const collect = (mod: PermissionModuleConfig): boolean[] => {
      const self = getModuleActions(mod.id).includes(action)
        ? [Boolean(permissions[mod.id]?.[action])]
        : [];
      const kids = mod.children?.flatMap(collect) ?? [];
      return [...self, ...kids];
    };
    const values = collect(module);
    const all = values.length > 0 && values.every(Boolean);
    const some = values.some(Boolean);
    return { all, indeterminate: some && !all };
  };

  const getColumnState = (action: PermissionAction) => {
    let total = 0;
    let checked = 0;
    walkPermissionModules().forEach((module) => {
      if (getModuleActions(module.id).includes(action)) {
        total += 1;
        if (permissions[module.id]?.[action]) checked += 1;
      }
    });
    return {
      all: checked === total && total > 0,
      indeterminate: checked > 0 && checked < total,
    };
  };

  const moduleSupportsAction = (
    mod: PermissionModuleConfig,
    action: PermissionAction
  ): boolean => {
    if (getModuleActions(mod.id).includes(action)) return true;
    return (
      mod.children?.some((child) => moduleSupportsAction(child, action)) ??
      false
    );
  };

  const renderModuleRow = (
    module: PermissionModuleConfig,
    depth: number
  ) => {
    const row = getRowState(module);
    const moduleActions = getModuleActions(module.id);
    const hasChildren = Boolean(module.children?.length);
    const isChild = depth > 0;
    const isIndicator = hasChildren && moduleActions.length === 0;
    const isEditing = activeModuleId === module.id;

    return (
      <Fragment key={module.id}>
        <tr
          onMouseDown={() => !disabled && setActiveModuleId(module.id)}
          onFocusCapture={() => !disabled && setActiveModuleId(module.id)}
          className={cn(
            "group/row border-b border-border/40 transition-colors",
            !disabled && !isEditing && "hover:bg-brand-soft/50",
            isEditing
              ? "bg-brand/10 ring-1 ring-inset ring-brand/40"
              : !isChild && hasChildren
                ? "bg-muted/20"
                : undefined
          )}
        >
          <td
            className={cn(
              "sticky left-0 z-10 border-l-4 px-4 py-2.5",
              isEditing
                ? "border-l-brand bg-brand/10"
                : "border-l-transparent",
              !isEditing && (!isChild && hasChildren ? "bg-muted/20" : "bg-card"),
              !disabled && !isEditing && "group-hover/row:bg-brand-soft/50"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2.5",
                isChild && "ml-4 border-l-2 border-brand/25 pl-3",
                isEditing && isChild && "border-brand/50"
              )}
            >
              {!disabled && (
                <Checkbox
                  checked={row.all}
                  indeterminate={row.indeterminate}
                  onChange={() =>
                    toggleModuleRow(
                      module,
                      nextTriState(row.all, row.indeterminate)
                    )
                  }
                  aria-label={`Toggle all ${module.label}`}
                />
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-[13px] leading-tight",
                      !isChild
                        ? "font-semibold text-foreground"
                        : "font-medium text-foreground/85",
                      isEditing && "text-brand"
                    )}
                  >
                    {module.label}
                  </p>
                  {hasChildren && !isChild && (
                    <span className="shrink-0 rounded-[6px] bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {module.children!.length} modules
                    </span>
                  )}
                  {isEditing && (
                    <span className="shrink-0 rounded-[6px] bg-brand px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Editing
                    </span>
                  )}
                </div>
                {module.description && !isIndicator ? (
                  <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
                    {module.description}
                  </p>
                ) : null}
              </div>
            </div>
          </td>

          {PERMISSION_ACTIONS.map((action) => {
            const isAvailable =
              moduleActions.includes(action) ||
              (isIndicator && moduleSupportsAction(module, action));
            const actionState =
              hasChildren || isIndicator
                ? getModuleActionState(module, action)
                : {
                    all: Boolean(permissions[module.id]?.[action]),
                    indeterminate: false,
                  };

            return (
              <td key={action} className="px-1.5 py-2.5 text-center sm:px-2">
                {isAvailable ? (
                  <div className="flex justify-center">
                    <Checkbox
                      checked={actionState.all}
                      indeterminate={actionState.indeterminate}
                      disabled={disabled}
                      onChange={() =>
                        toggleModuleAction(
                          module,
                          action,
                          nextTriState(
                            actionState.all,
                            actionState.indeterminate
                          )
                        )
                      }
                      aria-label={`${module.label} ${action}`}
                    />
                  </div>
                ) : (
                  <span
                    className="mx-auto block size-1.5 rounded-full bg-border/70"
                    aria-hidden
                  />
                )}
              </td>
            );
          })}
        </tr>
        {module.children?.map((child) => renderModuleRow(child, depth + 1))}
      </Fragment>
    );
  };

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/50">
              <th className="sticky left-0 z-20 bg-muted/50 px-4 py-3 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Module
                </span>
              </th>
              {PERMISSION_ACTIONS.map((action) => {
                const col = getColumnState(action);
                return (
                  <th
                    key={action}
                    className="px-1.5 py-3 text-center sm:px-2"
                    title={PERMISSION_ACTION_LABELS[action]}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
                        {PERMISSION_ACTION_LABELS[action]}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
                        {ACTION_SHORT[action]}
                      </span>
                      {!disabled && (
                        <Checkbox
                          checked={col.all}
                          indeterminate={col.indeterminate}
                          onChange={() =>
                            toggleActionColumn(
                              action,
                              nextTriState(col.all, col.indeterminate)
                            )
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
            {PERMISSION_MODULE_GROUPS.map((group) => {
              /** Avoid "Survey / Survey" — skip section header when it matches the only parent module */
              const sole = group.modules[0];
              const hideGroupHeader =
                group.modules.length === 1 &&
                sole?.label.toLowerCase() === group.label.toLowerCase() &&
                Boolean(sole?.children?.length);

              return (
                <Fragment key={group.id}>
                  {!hideGroupHeader ? (
                    <tr className="bg-brand-soft/50">
                      <td
                        colSpan={1 + PERMISSION_ACTIONS.length}
                        className="px-4 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-3.5 w-0.5 shrink-0 rounded-full bg-brand" />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                            {group.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  {group.modules.map((module) => renderModuleRow(module, 0))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
