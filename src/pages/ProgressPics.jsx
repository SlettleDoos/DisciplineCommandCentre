import React, { useState, useEffect } from "react";
import { Trash2, Save, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";

export default function ProgressPics() {
  const [musclePics, setMusclePics] = useState([]);
  const [cockPics, setCockPics] = useState([]);
  const [selectedPic, setSelectedPic] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // ------------------ FETCH DATA ------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/data");
        setMusclePics(
          res.data.musclePics.map((p) => ({ ...p, url: `/api/images/${p.fileId}`, type: "muscle" }))
        );
        setCockPics(
          res.data.cockPics.map((p) => ({ ...p, url: `/api/images/${p.fileId}`, type: "cock" }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // ------------------ UPLOAD ------------------
  const handleUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    const uploadedPics = [];

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("/api/upload", formData);
        const picData = {
          fileId: res.data.fileId,
          caption: "",
          date: new Date().toISOString().split("T")[0],
          url: `/api/images/${res.data.fileId}`,
          type,
        };
        uploadedPics.push(picData);
      } catch (err) {
        console.error(err);
      }
    }

    if (type === "muscle") {
      const newPics = [...musclePics, ...uploadedPics];
      setMusclePics(newPics);
      await saveData({ musclePics: newPics });
    } else {
      const newPics = [...cockPics, ...uploadedPics];
      setCockPics(newPics);
      await saveData({ cockPics: newPics });
    }
  };

  // ------------------ SAVE DATA ------------------
  const saveData = async (updatedFields) => {
    try {
      const currentData = await axios.get("/api/data");
      const newData = { ...currentData.data, ...updatedFields };
      await axios.put("/api/data", newData);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ DELETE ------------------
  const handleDelete = async (pic) => {
    if (pic.type === "muscle") {
      const newPics = musclePics.filter((p) => p.fileId !== pic.fileId);
      setMusclePics(newPics);
      await saveData({ musclePics: newPics });
    } else {
      const newPics = cockPics.filter((p) => p.fileId !== pic.fileId);
      setCockPics(newPics);
      await saveData({ cockPics: newPics });
    }
    setSelectedPic(null);
  };

  // ------------------ UPDATE ------------------
  const handleUpdate = async (updatedPic) => {
    const updateArr = (arr) =>
      arr.map((p) => (p.fileId === updatedPic.fileId ? updatedPic : p));

    if (updatedPic.type === "muscle") {
      const newPics = updateArr(musclePics);
      setMusclePics(newPics);
      await saveData({ musclePics: newPics });
    } else {
      const newPics = updateArr(cockPics);
      setCockPics(newPics);
      await saveData({ cockPics: newPics });
    }
    setSelectedPic(null);
  };

  // ------------------ GROUPING ------------------
  const groupPics = (pics) => {
    const groups = {};
    pics.forEach((pic) => {
      const [year, month, day] = pic.date.split("-");
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = {};
      if (!groups[year][month][day]) groups[year][month][day] = [];
      groups[year][month][day].push(pic);
    });
    return groups;
  };

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderGrouped = (pics) => {
    const groups = groupPics(pics);
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, months]) => (
        <div key={year} className="mb-4">
          <button
            onClick={() => toggleGroup(year)}
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            {expandedGroups[year] ? <ChevronDown /> : <ChevronRight />}
            {year}
          </button>
          {expandedGroups[year] &&
            Object.entries(months)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, days]) => (
                <div key={month} className="ml-6 mb-2">
                  <button
                    onClick={() => toggleGroup(`${year}-${month}`)}
                    className="flex items-center gap-2 text-lg font-semibold text-gray-300"
                  >
                    {expandedGroups[`${year}-${month}`] ? (
                      <ChevronDown />
                    ) : (
                      <ChevronRight />
                    )}
                    {month}
                  </button>
                  {expandedGroups[`${year}-${month}`] &&
                    Object.entries(days)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([day, pics]) => (
                        <div key={day} className="ml-8 mb-2">
                          <button
                            onClick={() =>
                              toggleGroup(`${year}-${month}-${day}`)
                            }
                            className="flex items-center gap-2 text-md font-medium text-gray-400"
                          >
                            {expandedGroups[`${year}-${month}-${day}`] ? (
                              <ChevronDown />
                            ) : (
                              <ChevronRight />
                            )}
                            {day}
                          </button>
                          {expandedGroups[`${year}-${month}-${day}`] && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                              {pics.map((pic, i) => (
                                <div
                                  key={i}
                                  className="relative cursor-pointer group"
                                  onClick={() => setSelectedPic(pic)}
                                >
                                  <img
                                    src={pic.url}
                                    alt="progress"
                                    className="w-full h-40 object-cover rounded-lg shadow-md group-hover:opacity-80 transition"
                                  />
                                  {pic.caption && (
                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                      {pic.caption}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              ))}
        </div>
      ));
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-gray-900 to-black min-h-screen p-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Muscle */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">💪 Muscle Progress</h2>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e, "muscle")}
                />
                <Button variant="secondary" asChild>
                  <span>Upload</span>
                </Button>
              </label>
            </div>
            {renderGrouped(musclePics)}
          </CardContent>
        </Card>

        {/* Cock */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">🍆 Cock Progress</h2>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e, "cock")}
                />
                <Button variant="secondary" asChild>
                  <span>Upload</span>
                </Button>
              </label>
            </div>
            {renderGrouped(cockPics)}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={!!selectedPic} onOpenChange={() => setSelectedPic(null)}>
        <DialogContent className="max-w-3xl bg-gray-900 text-white border-gray-700">
          {selectedPic && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Progress Pic</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <img
                  src={selectedPic.url}
                  alt="fullscreen"
                  className="object-contain max-h-[50vh] w-full rounded-lg shadow-md"
                />

                <Input
                  type="text"
                  value={selectedPic.caption}
                  onChange={(e) =>
                    setSelectedPic({ ...selectedPic, caption: e.target.value })
                  }
                  placeholder="Add a caption..."
                  className="bg-gray-800 border-gray-700 text-white"
                />

                <Input
                  type="date"
                  value={selectedPic.date}
                  onChange={(e) =>
                    setSelectedPic({ ...selectedPic, date: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />

                <div className="flex justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedPic)}
                  >
                    <Trash2 size={18} className="mr-1" /> Delete
                  </Button>
                  <Button onClick={() => handleUpdate(selectedPic)}>
                    <Save size={18} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );s
}
