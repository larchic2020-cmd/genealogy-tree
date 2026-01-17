"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TreeNode {
  id: number;
  name: string;
  birth: string;
  photo: string | null;
  children: TreeNode[];
  x?: number;
  y?: number;
}

const initialTree: TreeNode = {
  id: 1,
  name: "Иван Петров",
  birth: "1950",
  photo: null,
  children: [
    { id: 2, name: "Анна Петрова", birth: "1975", photo: null, children: [] },
    { id: 3, name: "Сергей Петров", birth: "1980", photo: null, children: [
      { id: 4, name: "Маша Сергеева", birth: "2005", photo: null, children: [] }
    ]}
  ]
};

function layoutTree(node: TreeNode, spacing = 180) {
  const nodes: TreeNode[] = [];
  const links: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];

  const traverse = (n: TreeNode, depth = 0, posX = 0) => {
    n.x = posX;
    n.y = depth * spacing;
    nodes.push(n);
    n.children.forEach((c, i) => {
      const childX = posX + (i - (n.children.length - 1) / 2) * spacing;
      links.push({ from: { x: posX, y: depth * spacing }, to: { x: childX, y: (depth + 1) * spacing } });
      traverse(c, depth + 1, childX);
    });
  };
  traverse(node);
  return { nodes, links };
}

export default function GenealogyApp() {
  const [tree, setTree] = useState(initialTree);
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const { nodes, links } = layoutTree(tree);

  const addChild = () => {
    if (!selected) return;
    const copy = JSON.parse(JSON.stringify(tree));
    const add = (n: TreeNode) => {
      if (n.id === selected.id) n.children.push({ id: Date.now(), name: "Новый человек", birth: "", photo: null, children: [] });
      else n.children.forEach(add);
    };
    add(copy);
    setTree(copy);
  };

  const updateSelected = (field: keyof TreeNode, value: string) => {
    if (!selected) return;
    const copy = JSON.parse(JSON.stringify(tree));
    const update = (n: TreeNode) => { if (n.id === selected.id) n[field] = value; else n.children.forEach(update); };
    update(copy);
    setTree(copy);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setTransform(prev => ({ ...prev, k: Math.min(Math.max(prev.k + delta, 0.2), 3) }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.origX = transform.x;
    dragRef.current.origY = transform.y;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform(prev => ({ ...prev, x: dragRef.current.origX + dx, y: dragRef.current.origY + dy }));
  };

  const handleMouseUp = () => { dragRef.current.dragging = false; };
  const handleCenter = () => { setTransform({ x: 0, y: 0, k: 1 }); };

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r p-4 flex flex-col gap-2">
        {selected ? (
          <>
            <h2 className="font-bold text-lg">Карточка</h2>
            <Input value={selected.name} onChange={e => updateSelected("name", e.target.value)} />
            <Input placeholder="Год рождения" value={selected.birth} onChange={e => updateSelected("birth", e.target.value)} />
            <Button onClick={addChild}>Добавить потомка</Button>
          </>
        ) : (
          <div className="text-gray-400">Выберите человека</div>
        )}
        <Button onClick={handleCenter} className="mt-4">Центрировать / Сброс масштаба</Button>
      </div>
      <div className="flex-1 overflow-auto" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <svg ref={svgRef} width="2000" height="2000" className="bg-gray-50">
          <g transform={`translate(${transform.x + 1000}, ${transform.y}) scale(${transform.k})`}>
            {links.map((l, i) => <line key={i} x1={l.from.x} y1={l.from.y + 50} x2={l.to.x} y2={l.to.y + 50} stroke="#999" />)}
            {nodes.map(n => (
              <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onClick={() => setSelected(n)}>
                <rect x={-60} y={0} width={120} height={60} rx={12} fill={selected?.id === n.id ? "#c7d2fe" : "#fff"} stroke="#333" />
                <text x={0} y={35} textAnchor="middle" fontSize={14}>{n.name}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}