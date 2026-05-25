import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { useToast } from '../../components/Toast';

const CategoryListAdmin = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const extract = (err) =>
    err.response?.data?.message || err.message || 'Request failed';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      setError(extract(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name: newName, description: newDesc });
      setCreating(false);
      setNewName('');
      setNewDesc('');
      toast.success('Category created');
      load();
    } catch (err) {
      const msg = extract(err);
      setError(msg);
      toast.error(msg);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditName(c.name);
    setEditDesc(c.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/categories/${id}`, {
        name: editName,
        description: editDesc,
      });
      cancelEdit();
      toast.success('Category updated');
      load();
    } catch (err) {
      const msg = extract(err);
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      const msg = extract(err);
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <section className="admin">
      <header className="admin__header admin__header--row">
        <div>
          <h1>Categories</h1>
          <p className="admin__subtitle">
            {categories.length} item{categories.length === 1 ? '' : 's'}
          </p>
        </div>
        {!creating && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreating(true)}
          >
            <FaPlus /> New Category
          </button>
        )}
      </header>

      {error && <div className="form-error">{error}</div>}

      {creating && (
        <form className="form-card admin__inlineForm" onSubmit={handleCreate}>
          <label>
            Name
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </label>
          <label>
            Description
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </label>
          <div className="admin__inlineActions">
            <button type="submit" className="btn btn-primary">
              Create
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="admin__tableWrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) =>
                editingId === c._id ? (
                  <tr key={c._id}>
                    <td>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="admin__actions">
                      <button
                        type="button"
                        className="icon-btn icon-btn--success"
                        onClick={() => saveEdit(c._id)}
                        title="Save"
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={cancelEdit}
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.description || '—'}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="admin__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit(c)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => handleDelete(c._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                )
              )}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin__empty">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CategoryListAdmin;
